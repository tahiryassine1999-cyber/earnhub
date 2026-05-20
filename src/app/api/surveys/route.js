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

    // Get all active surveys
    const surveys = await prisma.survey.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    // Get responses by this user
    const responses = await prisma.surveyResponse.findMany({
      where: { userId },
      select: { surveyId: true },
    });

    const completedSurveyIds = new Set(responses.map(r => r.surveyId));

    // Mark each survey as completed or not
    const surveysWithStatus = surveys.map(survey => ({
      ...survey,
      questions: JSON.parse(survey.questions),
      completed: completedSurveyIds.has(survey.id),
    }));

    return NextResponse.json({ surveys: surveysWithStatus });
  } catch (error) {
    console.error('Surveys GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { surveyId, answers } = await req.json();

    if (!surveyId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey || survey.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Survey not found or inactive' }, { status: 404 });
    }

    // Check if user already completed this survey
    const existingResponse = await prisma.surveyResponse.findUnique({
      where: {
        userId_surveyId: {
          userId,
          surveyId,
        },
      },
    });

    if (existingResponse) {
      return NextResponse.json({ error: 'Survey already completed' }, { status: 400 });
    }

    // Process completion in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create survey response
      await tx.surveyResponse.create({
        data: {
          userId,
          surveyId,
          answers: JSON.stringify(answers),
          earned: survey.reward,
        },
      });

      // 2. Increment filledSlots
      await tx.survey.update({
        where: { id: surveyId },
        data: {
          filledSlots: { increment: 1 },
          status: survey.filledSlots + 1 >= survey.totalSlots ? 'COMPLETED' : 'ACTIVE',
        },
      });

      // 3. Update User balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: survey.reward },
          totalEarned: { increment: survey.reward },
        },
      });

      // 4. Create transaction ledger record
      await tx.transaction.create({
        data: {
          userId,
          amount: survey.reward,
          type: 'SURVEY_REWARD',
          balanceAfter: updatedUser.balance,
          description: `Completed: ${survey.title}`,
        },
      });

      return {
        earned: survey.reward,
        newBalance: updatedUser.balance,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Survey POST error:', error);
    return NextResponse.json({ error: 'Failed to submit survey response' }, { status: 500 });
  }
}
