import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Calculate stats
    const totalUsers = await prisma.user.count();
    const activeSurveys = await prisma.survey.count({ where: { status: 'ACTIVE' } });
    
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balance: true,
        totalEarned: true,
        banned: true,
        createdAt: true,
      }
    });

    const totalEarningSum = users.reduce((sum, u) => sum + u.totalEarned, 0);

    const withdrawals = await prisma.withdrawalRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'PENDING').length;
    const pendingWithdrawalsSum = withdrawals.filter(w => w.status === 'PENDING').reduce((sum, w) => sum + w.amount, 0);

    const recentTransactions = await prisma.transaction.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalEarned: totalEarningSum,
        activeSurveys,
        pendingWithdrawalsCount,
        pendingWithdrawalsSum,
      },
      users,
      withdrawals,
      recentTransactions,
    });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...data } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }

    // 1. APPROVE / REJECT WITHDRAWALS
    if (action === 'approve_withdrawal' || action === 'complete_withdrawal') {
      const { withdrawalId } = data;
      if (!withdrawalId) return NextResponse.json({ error: 'Missing withdrawalId' }, { status: 400 });

      const updated = await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
        }
      });

      return NextResponse.json({ success: true, withdrawal: updated });
    }

    if (action === 'reject_withdrawal') {
      const { withdrawalId, adminNote } = data;
      if (!withdrawalId) return NextResponse.json({ error: 'Missing withdrawalId' }, { status: 400 });

      const withdrawal = await prisma.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
      });

      if (!withdrawal) return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
      if (withdrawal.status !== 'PENDING') return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 });

      // Process reject + refund in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update request status
        const updatedRequest = await tx.withdrawalRequest.update({
          where: { id: withdrawalId },
          data: {
            status: 'REJECTED',
            adminNote: adminNote || 'Rejected by administrator',
            processedAt: new Date(),
          }
        });

        // Refund user
        const updatedUser = await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            balance: { increment: withdrawal.amount },
          }
        });

        // Add refund transaction ledger record
        await tx.transaction.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: 'ADMIN_ADJUSTMENT',
            balanceAfter: updatedUser.balance,
            description: `Refund: Rejected withdrawal request #${withdrawalId.substring(0, 8)}`,
          }
        });

        return updatedRequest;
      });

      return NextResponse.json({ success: true, withdrawal: result });
    }

    // 2. USER MANAGEMENT (BAN/UNBAN/ADJUST BALANCE)
    if (action === 'ban_user') {
      const { userId } = data;
      if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { banned: true }
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'unban_user') {
      const { userId } = data;
      if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { banned: false }
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'adjust_balance') {
      const { userId, amount, description } = data;
      if (!userId || amount === undefined) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

      const adjustAmount = parseFloat(amount);
      if (isNaN(adjustAmount)) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

      const result = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            balance: { increment: adjustAmount },
            totalEarned: adjustAmount > 0 ? { increment: adjustAmount } : undefined,
          }
        });

        await tx.transaction.create({
          data: {
            userId,
            amount: adjustAmount,
            type: 'ADMIN_ADJUSTMENT',
            balanceAfter: updatedUser.balance,
            description: description || `Admin adjustment: ${adjustAmount > 0 ? '+' : ''}${adjustAmount}`,
          }
        });

        return updatedUser;
      });

      return NextResponse.json({ success: true, user: result });
    }

    // 3. SURVEY MANAGEMENT (CREATE/UPDATE/PAUSE)
    if (action === 'create_survey') {
      const { title, description, reward, timeMinutes, category, questions, totalSlots } = data;
      if (!title || !description || reward === undefined || !timeMinutes || !category || !questions) {
        return NextResponse.json({ error: 'Missing survey parameters' }, { status: 400 });
      }

      const survey = await prisma.survey.create({
        data: {
          title,
          description,
          reward: parseFloat(reward),
          timeMinutes: parseInt(timeMinutes),
          category,
          questions: typeof questions === 'string' ? questions : JSON.stringify(questions),
          totalSlots: parseInt(totalSlots) || 100,
        }
      });

      return NextResponse.json({ success: true, survey });
    }

    if (action === 'toggle_survey_status') {
      const { surveyId } = data;
      if (!surveyId) return NextResponse.json({ error: 'Missing surveyId' }, { status: 400 });

      const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
      if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 });

      const newStatus = survey.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const updated = await prisma.survey.update({
        where: { id: surveyId },
        data: { status: newStatus }
      });

      return NextResponse.json({ success: true, survey: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Failed to process admin action' }, { status: 500 });
  }
}
