import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error('Withdrawals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch withdrawal history' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { amount, method, paymentDetails } = await req.json();

    if (!amount || !method || !paymentDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get site settings for minimum withdrawal
    const siteSettings = await prisma.siteSettings.findUnique({
      where: { id: 'settings' },
    }) || { minWithdrawal: 5.00 };

    if (withdrawAmount < siteSettings.minWithdrawal) {
      return NextResponse.json({
        error: `Minimum withdrawal amount is $${siteSettings.minWithdrawal.toFixed(2)}`,
      }, { status: 400 });
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user || user.balance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Process withdrawal in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct user's balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: withdrawAmount },
        },
      });

      // 2. Create withdrawal request
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          userId,
          amount: withdrawAmount,
          method,
          paymentDetails,
          status: 'PENDING',
        },
      });

      // 3. Create transaction ledger entry (negative amount)
      await tx.transaction.create({
        data: {
          userId,
          amount: -withdrawAmount,
          type: 'WITHDRAWAL',
          balanceAfter: updatedUser.balance,
          description: `Withdrawal request (${method}) - Pending`,
        },
      });

      return {
        withdrawal,
        newBalance: updatedUser.balance,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Withdrawal POST error:', error);
    return NextResponse.json({ error: 'Failed to request withdrawal' }, { status: 500 });
  }
}
