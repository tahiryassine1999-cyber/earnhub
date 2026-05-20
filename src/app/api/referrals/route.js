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
        referralCode: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referrals made by this user
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          select: {
            name: true,
            createdAt: true,
            totalEarned: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalInvited = referrals.length;
    const totalReferralEarnings = referrals.reduce((sum, ref) => sum + ref.bonus, 0);

    const referredUsers = referrals.map(ref => ({
      id: ref.id,
      name: ref.referee.name,
      joinedAt: ref.createdAt,
      bonusAmount: ref.bonus,
      refereeTotalEarned: ref.referee.totalEarned,
    }));

    return NextResponse.json({
      referralCode: user.referralCode,
      totalInvited,
      totalReferralEarnings,
      referredUsers,
    });
  } catch (error) {
    console.error('Referrals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral details' }, { status: 500 });
  }
}
