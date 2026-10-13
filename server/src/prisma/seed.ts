import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CURATED_QUESTIONS = [
  // Deep Connections
  { text: "What small gesture from me always makes you feel deeply loved and appreciated?", category: "Deep Connections" },
  { text: "If we had an entire week completely off with zero obligations, what would our dream itinerary look like?", category: "Deep Connections" },
  { text: "What is one belief or value you hold that you hope we always pass down together?", category: "Deep Connections" },
  { text: "What is something you’ve learned about yourself since we’ve been together?", category: "Deep Connections" },
  { text: "When do you feel most connected and present with me?", category: "Deep Connections" },
  { text: "What is a vulnerability you were hesitant to share with me at first?", category: "Deep Connections" },
  { text: "How can I best support you when you are having a stressful or overwhelming day?", category: "Deep Connections" },

  // Fun & Quirky
  { text: "What is my weirdest habit or quirk that secretly makes you smile?", category: "Fun & Quirky" },
  { text: "If we were in a zombie apocalypse together, which one of us would survive longer and why?", category: "Fun & Quirky" },
  { text: "What is the funniest inside joke or moment that only the two of us understand?", category: "Fun & Quirky" },
  { text: "If you had to describe my personality using three foods or drinks, what would they be?", category: "Fun & Quirky" },
  { text: "Which song immediately makes you think of me whenever you hear it playing?", category: "Fun & Quirky" },
  { text: "If we entered a couples game show, which category would we dominate without question?", category: "Fun & Quirky" },

  // Preferences & Cozy
  { text: "What is your idea of a perfect, cozy Sunday evening together?", category: "Preferences & Cozy" },
  { text: "If we could teleport to any restaurant or street-food stall in the world right now, where are we going?", category: "Preferences & Cozy" },
  { text: "What is your absolute favorite comfort meal when it’s raining outside?", category: "Preferences & Cozy" },
  { text: "Are you more of an adventurous road-tripper or a serene beachfront lounger?", category: "Preferences & Cozy" },
  { text: "What’s one movie or series that we could re-watch together ten times and never get tired of?", category: "Preferences & Cozy" },

  // Memories & Milestones
  { text: "What was your very first thought or impression the first time we ever met or spoke?", category: "Memories & Milestones" },
  { text: "What has been our most chaotic, hilarious adventure or misadventure so far?", category: "Memories & Milestones" },
  { text: "What is a tiny, quiet memory of us that you cherish just as much as our big celebrations?", category: "Memories & Milestones" },
  { text: "What was the exact moment you realized we had something truly special together?", category: "Memories & Milestones" },
  { text: "What trip, date, or walk together holds the warmest place in your heart?", category: "Memories & Milestones" },

  // Future & Dreams
  { text: "What is one country, city, or hidden gem you are determined for us to explore together?", category: "Future & Dreams" },
  { text: "What kind of home or living space do you picture us creating in the future?", category: "Future & Dreams" },
  { text: "What is a new hobby, skill, or sport you’d love for us to learn as a duo?", category: "Future & Dreams" },
  { text: "Ten years from now, what is one tradition you hope we are still celebrating every year?", category: "Future & Dreams" },
  { text: "What dream project or goal do you want us to accomplish together in the next 12 months?", category: "Future & Dreams" },
];

async function main() {
  console.log('🌱 Starting PairPlay database seed...');

  // 1. Seed Questions
  let seededQuestions = 0;
  for (const q of CURATED_QUESTIONS) {
    const existing = await prisma.question.findFirst({
      where: { text: q.text },
    });
    if (!existing) {
      await prisma.question.create({
        data: {
          text: q.text,
          category: q.category,
          isAiGenerated: false,
        },
      });
      seededQuestions++;
    }
  }
  console.log(`✅ Seeded ${seededQuestions} curated questions.`);

  // 2. Seed Demo Couple Accounts for Instant Testing & Evaluation
  const demoPassword = await bcrypt.hash('LoveTogether123!', 10);

  const demoUser1 = await prisma.user.upsert({
    where: { email: 'alex@pairplay.app' },
    update: {},
    create: {
      email: 'alex@pairplay.app',
      displayName: 'Alex Chen',
      passwordHash: demoPassword,
      partnerCode: 'PAIR-ALEX',
      bio: 'Lover of sunsets, matcha lattes, and late-night talks ✨',
      interests: JSON.stringify(['Travel', 'Indie Music', 'Cooking', 'Board Games']),
      loveLanguage: 'Quality Time',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
  });

  const demoUser2 = await prisma.user.upsert({
    where: { email: 'sam@pairplay.app' },
    update: {},
    create: {
      email: 'sam@pairplay.app',
      displayName: 'Sam Rivera',
      passwordHash: demoPassword,
      partnerCode: 'PAIR-SAMR',
      bio: 'Coffee enthusiast, amateur chef, and avid camper 🏕️',
      interests: JSON.stringify(['Travel', 'Camping', 'Photography', 'Foodie']),
      loveLanguage: 'Words of Affirmation',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
  });

  // Link demo users as couple
  const existingCouple = await prisma.couple.findFirst({
    where: {
      OR: [
        { user1Id: demoUser1.id, user2Id: demoUser2.id },
        { user1Id: demoUser2.id, user2Id: demoUser1.id },
      ],
    },
  });

  if (!existingCouple) {
    await prisma.couple.create({
      data: {
        user1Id: demoUser1.id,
        user2Id: demoUser2.id,
        status: 'ACTIVE',
      },
    });
    console.log('✅ Created demo couple connection between Alex and Sam.');
  }

  // Seed sample analytics events
  const eventCount = await prisma.productEvent.count();
  if (eventCount === 0) {
    const events = [
      { eventType: 'signup_completed', metadata: JSON.stringify({ source: 'direct' }) },
      { eventType: 'room_created', metadata: JSON.stringify({ category: 'Deep Connections' }) },
      { eventType: 'invitation_accepted', metadata: JSON.stringify({ roomCode: 'PP-DEMO' }) },
      { eventType: 'game_started', metadata: JSON.stringify({ totalQuestions: 5 }) },
      { eventType: 'question_answered', metadata: JSON.stringify({ questionIndex: 1 }) },
      { eventType: 'question_answered', metadata: JSON.stringify({ questionIndex: 2 }) },
      { eventType: 'game_completed', metadata: JSON.stringify({ durationSec: 320 }) },
      { eventType: 'ai_generation_succeeded', metadata: JSON.stringify({ count: 5 }) },
      { eventType: 'reconnect_succeeded', metadata: JSON.stringify({ latencyMs: 45 }) },
    ];
    for (const e of events) {
      await prisma.productEvent.create({ data: e });
    }
    console.log('✅ Seeded demo product analytics events.');
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
