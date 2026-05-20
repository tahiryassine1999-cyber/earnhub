import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const offerId = searchParams.get('offerId');
    const amount = searchParams.get('amount');
    const signature = searchParams.get('signature');

    if (!userId || !offerId || !amount) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    const rewardAmount = parseFloat(amount);
    if (isNaN(rewardAmount) || rewardAmount <= 0) {
      return new NextResponse('Invalid amount', { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Verify if offer exists.
    let offer = await prisma.offer.findFirst({
      where: {
        OR: [
          { id: offerId },
          { externalId: offerId }
        ]
      }
    });

    if (!offer) {
      offer = await prisma.offer.create({
        data: {
          title: `External Offer: ${offerId}`,
          description: `Completed via external offer wall integration`,
          reward: rewardAmount,
          provider: 'External Wall',
          externalId: offerId,
          instructions: 'Completed via postback',
          category: 'Offer Wall',
          url: '#',
          status: 'ACTIVE',
        }
      });
    }

    // Check if already credited
    const existingCompletion = await prisma.offerCompletion.findUnique({
      where: {
        userId_offerId: {
          userId,
          offerId: offer.id,
        },
      },
    });

    if (existingCompletion && existingCompletion.status === 'CREDITED') {
      return new NextResponse('Already credited', { status: 200 });
    }

    // Process completion and transaction
    await prisma.$transaction(async (tx) => {
      await tx.offerCompletion.upsert({
        where: {
          userId_offerId: {
            userId,
            offerId: offer.id,
          },
        },
        update: {
          status: 'CREDITED',
          earned: rewardAmount,
        },
        create: {
          userId,
          offerId: offer.id,
          status: 'CREDITED',
          earned: rewardAmount,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: rewardAmount },
          totalEarned: { increment: rewardAmount },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: rewardAmount,
          type: 'OFFER_REWARD',
          balanceAfter: updatedUser.balance,
          description: `Postback Credit: ${offer.title} (${offer.provider})`,
        },
      });
    });

    // Return 1 as expected by major networks
    return new NextResponse('1', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (error) {
    console.error('Postback handler error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, offerId, amount, signature } = body;

    if (!userId || !offerId || !amount) {
      return new NextResponse('Missing parameters', { status: 400 });
    }

    const rewardAmount = parseFloat(amount);
    if (isNaN(rewardAmount) || rewardAmount <= 0) {
      return new NextResponse('Invalid amount', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    let offer = await prisma.offer.findFirst({
      where: {
        OR: [
          { id: offerId },
          { externalId: offerId }
        ]
      }
    });

    if (!offer) {
      offer = await prisma.offer.create({
        data: {
          title: `External Offer: ${offerId}`,
          description: `Completed via external offer wall integration`,
          reward: rewardAmount,
          provider: 'External Wall',
          externalId: offerId,
          instructions: 'Completed via postback',
          category: 'Offer Wall',
          url: '#',
          status: 'ACTIVE',
        }
      });
    }

    const existingCompletion = await prisma.offerCompletion.findUnique({
      where: {
        userId_offerId: {
          userId,
          offerId: offer.id,
        },
      },
    });

    if (existingCompletion && existingCompletion.status === 'CREDITED') {
      return new NextResponse('Already credited', { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.offerCompletion.upsert({
        where: {
          userId_offerId: {
            userId,
            offerId: offer.id,
          },
        },
        update: {
          status: 'CREDITED',
          earned: rewardAmount,
        },
        create: {
          userId,
          offerId: offer.id,
          status: 'CREDITED',
          earned: rewardAmount,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: rewardAmount },
          totalEarned: { increment: rewardAmount },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: rewardAmount,
          type: 'OFFER_REWARD',
          balanceAfter: updatedUser.balance,
          description: `Postback Credit: ${offer.title} (${offer.provider})`,
        },
      });
    });

    return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (error) {
    console.error('Postback POST error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
