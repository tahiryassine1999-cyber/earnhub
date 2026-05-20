import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const SECTORS = [
  { index: 0, minAngle: 0, maxAngle: 45, value: 0.05, label: '$0.05', weight: 40 },
  { index: 1, minAngle: 45, maxAngle: 90, value: 0.10, label: '$0.10', weight: 25 },
  { index: 2, minAngle: 90, maxAngle: 135, value: 0.25, label: '$0.25', weight: 15 },
  { index: 3, minAngle: 135, maxAngle: 180, value: 0.50, label: '$0.50', weight: 10 },
  { index: 4, minAngle: 180, maxAngle: 225, value: 1.00, label: '$1.00', weight: 5 },
  { index: 5, minAngle: 225, maxAngle: 270, value: 2.50, label: '$2.50', weight: 3 },
  { index: 6, minAngle: 270, maxAngle: 315, value: 5.00, label: '$5.00', weight: 1.9 },
  { index: 7, minAngle: 315, maxAngle: 360, value: 50.00, label: '$50.00 Jackpot!', weight: 0.1 }
];

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Find the last daily spin transaction in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastSpin = await prisma.transaction.findFirst({
      where: {
        userId,
        type: 'DAILY_SPIN',
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (lastSpin) {
      const timeDiff = Date.now() - new Date(lastSpin.createdAt).getTime();
      const remainingMs = (24 * 60 * 60 * 1000) - timeDiff;
      return NextResponse.json({
        canSpin: false,
        remainingMs,
        lastClaimed: lastSpin.createdAt
      });
    }

    return NextResponse.json({
      canSpin: true,
      remainingMs: 0
    });
  } catch (error) {
    console.error('Spin GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if the user has spun in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastSpin = await prisma.transaction.findFirst({
      where: {
        userId,
        type: 'DAILY_SPIN',
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    if (lastSpin) {
      const timeDiff = Date.now() - new Date(lastSpin.createdAt).getTime();
      const remainingMs = (24 * 60 * 60 * 1000) - timeDiff;
      return NextResponse.json({
        error: 'Daily Spin already claimed. Please wait for the timer to expire.',
        remainingMs
      }, { status: 400 });
    }

    // Perform weighted random selection
    const rand = Math.random() * 100;
    let accum = 0;
    let selectedSector = SECTORS[0];

    for (const sector of SECTORS) {
      accum += sector.weight;
      if (rand <= accum) {
        selectedSector = sector;
        break;
      }
    }

    // Calculate dynamic visual angle within the sector (keep a small padding from sector edges)
    const padding = 6; // degrees padding from edges
    const sectorAngleRange = selectedSector.maxAngle - selectedSector.minAngle;
    const offset = padding + (Math.random() * (sectorAngleRange - padding * 2));
    const targetAngle = selectedSector.minAngle + offset;

    // 8 full spins + correct clockwise rotation offset
    const rotations = 8;
    const finalAngle = (rotations * 360) + (360 - targetAngle);

    const bonusAmount = selectedSector.value;

    // Update user balance and transaction ledger safely inside database transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: bonusAmount },
          totalEarned: { increment: bonusAmount }
        }
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: bonusAmount,
          type: 'DAILY_SPIN',
          balanceAfter: updatedUser.balance,
          description: `Daily Streak Spin Reward: ${selectedSector.label}`
        }
      });

      return {
        newBalance: updatedUser.balance
      };
    });

    return NextResponse.json({
      success: true,
      sector: selectedSector.index,
      amount: selectedSector.value,
      label: selectedSector.label,
      angle: finalAngle,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Spin POST error:', error);
    return NextResponse.json({ error: 'Failed to claim daily spin' }, { status: 500 });
  }
}
