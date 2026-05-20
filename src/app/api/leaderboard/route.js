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

    // Fetch top 15 earners
    const topEarners = await prisma.user.findMany({
      where: { banned: false },
      select: {
        id: true,
        name: true,
        avatar: true,
        totalEarned: true,
      },
      orderBy: { totalEarned: 'desc' },
      take: 15,
    });

    // Calculate current user's rank
    const allEarners = await prisma.user.findMany({
      where: { banned: false },
      select: { id: true },
      orderBy: { totalEarned: 'desc' },
    });

    const userRank = allEarners.findIndex(u => u.id === userId) + 1;

    return NextResponse.json({
      leaderboard: topEarners.map((user, idx) => ({
        rank: idx + 1,
        ...user,
        isCurrentUser: user.id === userId,
      })),
      currentUserRank: userRank,
    });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}
