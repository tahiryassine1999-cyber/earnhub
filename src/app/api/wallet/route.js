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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        totalEarned: true,
        lastDailyBonus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      balance: user.balance,
      totalEarned: user.totalEarned,
      lastDailyBonus: user.lastDailyBonus,
      transactions,
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet info' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastDailyBonus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if daily bonus is available (24 hours check)
    const now = new Date();
    if (user.lastDailyBonus) {
      const timeDiff = now.getTime() - new Date(user.lastDailyBonus).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (timeDiff < twentyFourHours) {
        const remainingMs = twentyFourHours - timeDiff;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return NextResponse.json({
          error: `Daily bonus already claimed. Try again in ${remainingHours} hours.`,
        }, { status: 400 });
      }
    }

    const siteSettings = await prisma.siteSettings.findUnique({
      where: { id: 'settings' },
    }) || { dailyBonusAmount: 0.05 };

    const bonusAmount = siteSettings.dailyBonusAmount;

    // Process daily bonus in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: bonusAmount },
          totalEarned: { increment: bonusAmount },
          lastDailyBonus: now,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: bonusAmount,
          type: 'DAILY_BONUS',
          balanceAfter: updatedUser.balance,
          description: 'Daily login bonus',
        },
      });

      return {
        earned: bonusAmount,
        newBalance: updatedUser.balance,
        lastDailyBonus: now,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Wallet POST error:', error);
    return NextResponse.json({ error: 'Failed to claim daily bonus' }, { status: 500 });
  }
}
