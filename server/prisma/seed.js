import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; 

const prisma = new PrismaClient();

async function main() {
  console.log('⛏️ Mining student data into the database...');

  // Hash a default password for all seeded users (e.g., "password123")
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.student.createMany({
    data: [
      { name: 'Alex Johnson', email: 'alex@blocklearn.edu', password: hashedPassword, avatar: '⛏️', grade: 'A', engagement: 92, status: 'active', lastActive: '2 min ago', trend: 'up' },
      { name: 'Liam Brown', email: 'liam@blocklearn.edu', password: hashedPassword, avatar: '🪓', grade: 'D', engagement: 32, status: 'disengaged', lastActive: '5 days ago', trend: 'down' },
      { name: 'Sophia Chen', email: 'sophia@blocklearn.edu', password: hashedPassword, avatar: '🛡️', grade: 'A-', engagement: 88, status: 'active', lastActive: '5 min ago', trend: 'up' },
      { name: 'James Wilson', email: 'james@blocklearn.edu', password: hashedPassword, avatar: '🧪', grade: 'C', engagement: 45, status: 'at-risk', lastActive: '2 days ago', trend: 'down' },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('💡 Hint: You can log in with any of these emails and the password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });