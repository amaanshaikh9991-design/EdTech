import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import Groq from 'groq-sdk';

// Load environment variables
dotenv.config();

const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
app.use(cors()); // Allows your React frontend to talk to this backend
app.use(express.json());

// 🟢 1. Get All Students
app.get('/api/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 2. Get Single Student + Chat History
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { chatHistory: { orderBy: { createdAt: 'asc' } } }
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🤖 3. AI Chat Endpoint (The Magic!)
app.post('/api/chat', async (req, res) => {
  const { studentId, message } = req.body;

  try {
    // 1. Save the student's message to the database
    await prisma.chatMessage.create({
      data: { studentId: parseInt(studentId), role: 'student', content: message }
    });

    // 2. Get recent chat history to give the AI context
    const history = await prisma.chatMessage.findMany({
      where: { studentId: parseInt(studentId) },
      orderBy: { createdAt: 'asc' },
      take: 10 // Keep it fast by only looking at the last 10 messages
    });

    // 3. Format messages for Groq
    const messages = [
      {
        role: "system",
        content: "You are EduCraft AI, a friendly and encouraging AI tutor for students. You help them understand their engagement, suggest study tips, and motivate them. Keep answers concise (under 3 sentences) and use Minecraft-themed emojis occasionally (like ⛏️, 🟩, 🗡️)."
      },
      ...history.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    // 4. Call the Free Groq API (Llama 3.1)
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "openai/gpt-oss-20b",
      temperature: 0.7,
      max_tokens: 200,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I couldn't process that, try again!";

    // 5. Save the AI's response to the database
    await prisma.chatMessage.create({
      data: { studentId: parseInt(studentId), role: 'ai', content: aiResponse }
    });

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ error: "AI failed to respond." });
  }
});

// 🟢 4. Signup Endpoint (Create a new Student in Neon DB)
app.post('/api/signup', async (req, res) => {
  const { name, email } = req.body;

  try {
    // 1. Check if a student with this email already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    });

    if (existingStudent) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // 2. Create the new student in the database
    const newStudent = await prisma.student.create({
      data: {
        name: name,
        email: email,
        avatar: '️', // Default Minecraft avatar
        grade: 'A',  // Starting grade
        engagement: 50, // Starting engagement
        status: 'active',
        lastActive: 'Just now',
        trend: 'stable'
      }
    });

    res.json(newStudent);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Failed to create account." });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`️ EduCraft Server mining on http://localhost:${PORT}`);
});