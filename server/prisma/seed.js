import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⛏️ Mining student data into the database...');

  await prisma.student.createMany({
    data: [
      { name: 'Alex Johnson', email: 'alex@blocklearn.edu', avatar: '️', grade: 'A', engagement: 92, status: 'active', lastActive: '2 min ago', trend: 'up' },
      { name: 'Liam Brown', email: 'liam@blocklearn.edu', avatar: '🪓', grade: 'D', engagement: 32, status: 'disengaged', lastActive: '5 days ago', trend: 'down' },
      { name: 'Sophia Chen', email: 'sophia@blocklearn.edu', avatar: '🛡️', grade: 'A-', engagement: 88, status: 'active', lastActive: '5 min ago', trend: 'up' },
      { name: 'James Wilson', email: 'james@blocklearn.edu', avatar: '🧪', grade: 'C', engagement: 45, status: 'at-risk', lastActive: '2 days ago', trend: 'down' },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });