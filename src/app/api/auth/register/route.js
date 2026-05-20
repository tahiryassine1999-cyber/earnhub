import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { name, email, password, referralCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a unique referral code for the new user
    let uniqueCode;
    let codeExists = true;
    while (codeExists) {
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      uniqueCode = `EH-${name.replace(/\s+/g, '').substring(0, 3).toUpperCase()}${randomStr}`;
      const found = await prisma.user.findUnique({
        where: { referralCode: uniqueCode }
      });
      if (!found) codeExists = false;
    }

    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
    }

    const siteSettings = await prisma.siteSettings.findUnique({
      where: { id: 'settings' }
    }) || { referralBonus: 1.0 };

    const bonusAmount = siteSettings.referralBonus;

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          referralCode: uniqueCode,
          referredBy: referrer ? referralCode : null,
          balance: referrer ? bonusAmount : 0.0,
          totalEarned: referrer ? bonusAmount : 0.0,
          avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        },
      });

      if (referrer) {
        // Create referral mapping
        await tx.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: user.id,
            bonus: bonusAmount,
          },
        });

        // Add bonus transaction for the referee
        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: bonusAmount,
            type: 'REFERRAL_BONUS',
            balanceAfter: bonusAmount,
            description: `Registration referral bonus from ${referrer.name}`,
          },
        });

        // Credit referrer with referral bonus too
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            balance: { increment: bonusAmount },
            totalEarned: { increment: bonusAmount },
          },
        });

        const updatedReferrer = await tx.user.findUnique({
          where: { id: referrer.id },
          select: { balance: true }
        });

        await tx.transaction.create({
          data: {
            userId: referrer.id,
            amount: bonusAmount,
            type: 'REFERRAL_BONUS',
            balanceAfter: updatedReferrer.balance,
            description: `Referral bonus for inviting ${name}`,
          },
        });
      }

      return user;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
