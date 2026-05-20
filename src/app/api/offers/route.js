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

    // Get all active offers
    const offers = await prisma.offer.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { featured: 'desc' },
    });

    // Get offer completions by this user
    const completions = await prisma.offerCompletion.findMany({
      where: { userId },
    });

    const completionMap = new Map(completions.map(c => [c.offerId, c.status]));

    const offersWithStatus = offers.map(offer => ({
      ...offer,
      status: completionMap.get(offer.id) || 'AVAILABLE', // AVAILABLE, PENDING, CREDITED, REJECTED
    }));

    return NextResponse.json({ offers: offersWithStatus });
  } catch (error) {
    console.error('Offers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { offerId, action } = await req.json(); // action can be 'start' or 'complete'

    if (!offerId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer || offer.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Offer not found or inactive' }, { status: 404 });
    }

    const existingCompletion = await prisma.offerCompletion.findUnique({
      where: {
        userId_offerId: {
          userId,
          offerId,
        },
      },
    });

    if (action === 'start') {
      if (existingCompletion) {
        return NextResponse.json({
          success: true,
          status: existingCompletion.status,
          message: 'Offer already started or completed',
        });
      }

      const completion = await prisma.offerCompletion.create({
        data: {
          userId,
          offerId,
          status: 'PENDING',
          earned: 0,
        },
      });

      return NextResponse.json({ success: true, status: 'PENDING', completion });
    }

    if (action === 'complete') {
      if (existingCompletion && existingCompletion.status === 'CREDITED') {
        return NextResponse.json({ error: 'Offer already completed and credited' }, { status: 400 });
      }

      // Process completion in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create or update offer completion
        const completion = await tx.offerCompletion.upsert({
          where: {
            userId_offerId: {
              userId,
              offerId,
            },
          },
          update: {
            status: 'CREDITED',
            earned: offer.reward,
          },
          create: {
            userId,
            offerId,
            status: 'CREDITED',
            earned: offer.reward,
          },
        });

        // 2. Credit user
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            balance: { increment: offer.reward },
            totalEarned: { increment: offer.reward },
          },
        });

        // 3. Log transaction
        await tx.transaction.create({
          data: {
            userId,
            amount: offer.reward,
            type: 'OFFER_REWARD',
            balanceAfter: updatedUser.balance,
            description: `Offer Completed: ${offer.title} (${offer.provider})`,
          },
        });

        return {
          status: 'CREDITED',
          earned: offer.reward,
          newBalance: updatedUser.balance,
        };
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Offers POST error:', error);
    return NextResponse.json({ error: 'Failed to process offer action' }, { status: 500 });
  }
}
