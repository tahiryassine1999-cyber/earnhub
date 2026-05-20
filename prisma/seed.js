const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean existing database
  await prisma.transaction.deleteMany({});
  await prisma.surveyResponse.deleteMany({});
  await prisma.offerCompletion.deleteMany({});
  await prisma.withdrawalRequest.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.survey.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.siteSettings.deleteMany({});

  // Hashes for passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@earnhub.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      avatar: 'SA',
      referralCode: 'EH-ADMIN1',
      balance: 100.0,
      totalEarned: 100.0,
      emailVerified: true,
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@earnhub.com',
      password: userPassword,
      name: 'John Doe',
      role: 'USER',
      avatar: 'JD',
      referralCode: 'EH-JD5521',
      balance: 15.75,
      totalEarned: 25.75,
      emailVerified: true,
      referredBy: 'EH-ADMIN1',
    },
  });

  // Create referral record
  await prisma.referral.create({
    data: {
      referrerId: adminUser.id,
      refereeId: normalUser.id,
      bonus: 1.0,
    },
  });

  // Create default site settings
  await prisma.siteSettings.create({
    data: {},
  });

  // Create initial transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: normalUser.id,
        amount: 1.0,
        type: 'REFERRAL_BONUS',
        balanceAfter: 1.0,
        description: 'Bonus for registering with a referral code',
      },
      {
        userId: normalUser.id,
        amount: 10.0,
        type: 'SURVEY_REWARD',
        balanceAfter: 11.0,
        description: 'Completed: Tech & Gadget Preferences Survey',
      },
      {
        userId: normalUser.id,
        amount: 14.75,
        type: 'OFFER_REWARD',
        balanceAfter: 25.75,
        description: 'Completed Offer: Raid: Shadow Legends App Install',
      },
      {
        userId: normalUser.id,
        amount: -10.0,
        type: 'WITHDRAWAL',
        balanceAfter: 15.75,
        description: 'Withdrawal to PayPal (Completed)',
      },
      {
        userId: adminUser.id,
        amount: 100.0,
        type: 'ADMIN_ADJUSTMENT',
        balanceAfter: 100.0,
        description: 'Initial platform administrative balance',
      },
    ],
  });

  // Create a mock withdrawal request
  await prisma.withdrawalRequest.create({
    data: {
      userId: normalUser.id,
      amount: 10.0,
      method: 'PAYPAL',
      status: 'COMPLETED',
      paymentDetails: 'paypal-buyer@example.com',
    },
  });

  // 2. Create Surveys
  const surveysData = [
    {
      title: 'Tech & Gadget Preferences 2026',
      description: 'Share your opinions about current tech trends, smartphones, smart home devices, and future expectations.',
      reward: 1.50,
      timeMinutes: 10,
      category: 'Technology',
      status: 'ACTIVE',
      totalSlots: 500,
      filledSlots: 24,
      questions: JSON.stringify([
        {
          id: 'q1',
          type: 'choice',
          title: 'Which mobile operating system do you primarily use?',
          options: ['iOS (iPhone)', 'Android', 'Other / None'],
        },
        {
          id: 'q2',
          type: 'choice',
          title: 'How often do you upgrade your primary smartphone?',
          options: ['Every year', 'Every 2 years', 'Every 3+ years', 'Only when it breaks'],
        },
        {
          id: 'q3',
          type: 'rating',
          title: 'On a scale of 1-5, how interested are you in smart home devices?',
          options: ['1 (Not interested)', '2', '3', '4', '5 (Extremely interested)'],
        },
        {
          id: 'q4',
          type: 'text',
          title: 'What is one tech product you cannot live without and why?',
        },
      ]),
    },
    {
      title: 'Coffee & Breakfast Habits',
      description: 'A quick marketing study about your morning coffee routines, preferences, and breakfast buying behaviors.',
      reward: 0.75,
      timeMinutes: 5,
      category: 'Food & Beverage',
      status: 'ACTIVE',
      totalSlots: 1000,
      filledSlots: 154,
      questions: JSON.stringify([
        {
          id: 'q1',
          type: 'choice',
          title: 'Do you drink coffee?',
          options: ['Yes, every day', 'Yes, sometimes', 'Rarely or never'],
        },
        {
          id: 'q2',
          type: 'choice',
          title: 'Where do you get your coffee most often?',
          options: ['Brew at home', 'Local coffee shop', 'Starbucks / Dunkin / chains', 'Office / Work'],
        },
        {
          id: 'q3',
          type: 'choice',
          title: 'Do you normally eat breakfast?',
          options: ['Yes, cooked at home', 'Yes, quick meal (cereal/toast)', 'Yes, bought on the way', 'No, skip breakfast'],
        },
      ]),
    },
    {
      title: 'Gaming Interests & Streaming Habits',
      description: 'Tell us about the video games you play, console preferences, and streaming platforms like Twitch or YouTube.',
      reward: 2.25,
      timeMinutes: 15,
      category: 'Entertainment',
      status: 'ACTIVE',
      totalSlots: 200,
      filledSlots: 87,
      questions: JSON.stringify([
        {
          id: 'q1',
          type: 'choice',
          title: 'What is your primary gaming platform?',
          options: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile Phone', 'None'],
        },
        {
          id: 'q2',
          type: 'choice',
          title: 'How many hours per week do you spend playing games?',
          options: ['Under 5 hours', '5-10 hours', '10-20 hours', '20+ hours'],
        },
        {
          id: 'q3',
          type: 'choice',
          title: 'Which gaming subscription services do you active use?',
          options: ['Xbox Game Pass', 'PlayStation Plus', 'Nintendo Switch Online', 'None / Other'],
        },
        {
          id: 'q4',
          type: 'choice',
          title: 'Do you watch game streamers on Twitch/YouTube?',
          options: ['Yes, daily', 'Yes, weekly', 'Occasionally', 'Never'],
        },
      ]),
    },
    {
      title: 'Remote Work & Productivity in 2026',
      description: 'Help us understand remote work setups, productivity tools, and the challenges of working from home.',
      reward: 3.00,
      timeMinutes: 18,
      category: 'Business',
      status: 'ACTIVE',
      totalSlots: 300,
      filledSlots: 12,
      questions: JSON.stringify([
        {
          id: 'q1',
          type: 'choice',
          title: 'What is your current work arrangement?',
          options: ['Fully remote', 'Hybrid (some days in office)', 'Fully in-person / office', 'Unemployed / Student / Retired'],
        },
        {
          id: 'q2',
          type: 'choice',
          title: 'Which collaboration tool does your team use the most?',
          options: ['Slack', 'Microsoft Teams', 'Discord', 'Email / Phone', 'Other'],
        },
        {
          id: 'q3',
          type: 'rating',
          title: 'How would you rate your productivity when working remotely?',
          options: ['1 (Much less productive)', '2', '3 (Same)', '4', '5 (Much more productive)'],
        },
        {
          id: 'q4',
          type: 'text',
          title: 'What is the single biggest challenge you face when working remotely?',
        },
      ]),
    },
    {
      title: 'Fitness & Gym Product Choices',
      description: 'Share your fitness routine, activewear brand preferences, and nutritional supplements you purchase.',
      reward: 1.20,
      timeMinutes: 8,
      category: 'Lifestyle',
      status: 'ACTIVE',
      totalSlots: 400,
      filledSlots: 3,
      questions: JSON.stringify([
        {
          id: 'q1',
          type: 'choice',
          title: 'How often do you exercise or play sports?',
          options: ['5+ times a week', '3-4 times a week', '1-2 times a week', 'Rarely', 'Never'],
        },
        {
          id: 'q2',
          type: 'choice',
          title: 'Do you hold an active gym membership?',
          options: ['Yes, commercial gym', 'Yes, boutique studio (Crossfit, Yoga, etc.)', 'No, I workout at home/outdoors', 'No, do not exercise'],
        },
        {
          id: 'q3',
          type: 'choice',
          title: 'What is your preferred athletic brand?',
          options: ['Nike', 'Adidas', 'Lululemon', 'Under Armour', 'Other / Generic'],
        },
      ]),
    },
  ];

  for (const s of surveysData) {
    await prisma.survey.create({ data: s });
  }

  // 3. Create Offers
  const offersData = [
    {
      title: 'Raid: Shadow Legends',
      description: 'Install the app and complete stage 3 on normal difficulty to earn your massive reward.',
      reward: 12.50,
      provider: 'Lootably',
      externalId: 'loot-raid-shadow-1',
      instructions: '1. Click "Earn" button\n2. Download and install the app\n3. Complete Stage 3 on Normal difficulty\n4. Reward will credit in 24 hours. New users only!',
      category: 'App Install',
      difficulty: 'MEDIUM',
      iconUrl: '⚔️',
      url: 'https://lootably.com/offers/raid-shadow-legends',
      status: 'ACTIVE',
    },
    {
      title: 'AliExpress Shopping Offer',
      description: 'Make a purchase of $5 or more on AliExpress as a new customer and get reimbursed plus bonus.',
      reward: 8.00,
      provider: 'Offertoro',
      externalId: 'toro-aliexpress-buy',
      instructions: '1. Click link and download AliExpress app.\n2. Create a new account.\n3. Make your first purchase of $5.00+.\n4. Credits instantly after purchase confirmation.',
      category: 'Purchase',
      difficulty: 'HARD',
      iconUrl: '🛍️',
      url: 'https://offertoro.com/offers/aliexpress',
      status: 'ACTIVE',
    },
    {
      title: 'Coin Master - Reach Village 4',
      description: 'Install Coin Master, play the game, and complete Village 4 within 7 days.',
      reward: 6.50,
      provider: 'AdGate',
      externalId: 'adg-coinmaster-4',
      instructions: '1. Download the app through our link.\n2. Spin and build villages.\n3. Reach Village 4 within 7 days.\n4. Reward credits instantly upon completion.',
      category: 'App Install',
      difficulty: 'MEDIUM',
      iconUrl: '🐷',
      url: 'https://adgatemedia.com/offers/coin-master',
      status: 'ACTIVE',
    },
    {
      title: 'OpinionStar Survey Panel Signup',
      description: 'Sign up for the OpinionStar survey panel, verify email, and complete your first demographic profile.',
      reward: 1.80,
      provider: 'CPX Research',
      externalId: 'cpx-signup-opinionstar',
      instructions: '1. Click link and sign up.\n2. Confirm your email address.\n3. Complete the initial profile questions.\n4. New users only.',
      category: 'Sign Up',
      difficulty: 'EASY',
      iconUrl: '⭐',
      url: 'https://cpx-research.com/offers/opinionstar',
      status: 'ACTIVE',
    },
    {
      title: 'NordVPN — 2 Year Plan',
      description: 'Purchase NordVPN 2-Year Plan and protect your online privacy. Earn a huge cashback bonus.',
      reward: 45.00,
      provider: 'Offertoro',
      externalId: 'toro-nordvpn-2yr',
      instructions: '1. Click through link and purchase a 2-Year subscription plan.\n2. Must not request a refund within 30 days.\n3. Points credit in pending status, fully paid in 30 days.',
      category: 'Purchase',
      difficulty: 'HARD',
      iconUrl: '🛡️',
      url: 'https://offertoro.com/offers/nordvpn',
      status: 'ACTIVE',
    },
    {
      title: 'Watch Ads & Trailers',
      description: 'Watch short video ads and game trailers. Earn a small reward for every 3 videos watched.',
      reward: 0.05,
      provider: 'EarnHub TV',
      externalId: 'eh-tv-videos',
      instructions: '1. Click start.\n2. Watch 3 video ads completely.\n3. Do not close or skip.\n4. Repeatable up to 20 times daily.',
      category: 'Watch Video',
      difficulty: 'EASY',
      iconUrl: '📺',
      url: '#',
      status: 'ACTIVE',
    },
  ];

  for (const o of offersData) {
    await prisma.offer.create({ data: o });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
