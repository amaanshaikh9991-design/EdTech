import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // ✅ Added for password hashing
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
app.use(cors());
app.use(express.json());

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const gradeFromPercentage = (percentage) => {
  if (percentage === null) return 'N/A';
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

async function refreshStudentSummary(studentId) {
  const [student, scores] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, select: { engagement: true } }),
    prisma.task.aggregate({
      where: { studentId, isComplete: true },
      _sum: { score: true, maxScore: true },
    }),
  ]);

  const maxScore = scores._sum.maxScore || 0;
  const percentage = maxScore > 0
    ? Math.round((scores._sum.score / maxScore) * 100)
    : null;
  const previousPercentage = student?.engagement || 0;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      grade: gradeFromPercentage(percentage),
      engagement: percentage ?? 0,
      trend: percentage === null || percentage === previousPercentage
        ? 'stable'
        : percentage > previousPercentage ? 'up' : 'down',
      lastActive: 'Just now',
    },
  });
}

// 🟢 1. Get All Students
app.get('/api/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      select: { id: true, name: true, email: true, school: true, grade: true, engagement: true },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 2. Get Single Student + Chat History
app.get('/api/students/:id', async (req, res) => {
  try {
    const studentId = parseId(req.params.id);
    if (!studentId) return res.status(400).json({ error: 'Invalid student ID.' });

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        chatHistory: { orderBy: { createdAt: 'asc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const safeStudent = { ...student };
    delete safeStudent.password;
    res.json(safeStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students/:studentId/tasks', async (req, res) => {
  const studentId = parseId(req.params.studentId);
  const { title, subject, resultFormat = 'percentage', dueAt } = req.body;
  const score = Number(req.body.score);
  const maxScore = Number(req.body.maxScore);

  if (!studentId) return res.status(400).json({ error: 'Invalid student ID.' });
  if (!title?.trim() || !subject?.trim()) {
    return res.status(400).json({ error: 'Task title and subject are required.' });
  }
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || score < 0 || maxScore <= 0 || score > maxScore) {
    return res.status(400).json({ error: 'Enter valid marks between zero and the maximum marks.' });
  }
  if (!['percentage', 'grade', 'points'].includes(resultFormat)) {
    return res.status(400).json({ error: 'Choose percentage, grade, or points for the result display.' });
  }

  const dueDate = dueAt ? new Date(dueAt) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return res.status(400).json({ error: 'Enter a valid due date.' });
  }

  try {
    const task = await prisma.task.create({
      data: {
        studentId,
        title: title.trim(),
        subject: subject.trim(),
        score,
        maxScore,
        resultFormat,
        dueAt: dueDate,
      },
    });
    await refreshStudentSummary(studentId);
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: 'Could not save this task.' });
  }
});

app.patch('/api/students/:studentId/tasks/:taskId', async (req, res) => {
  const studentId = parseId(req.params.studentId);
  const taskId = parseId(req.params.taskId);

  if (!studentId || !taskId || typeof req.body.isComplete !== 'boolean') {
    return res.status(400).json({ error: 'A valid task and completion state are required.' });
  }

  try {
    const existingTask = await prisma.task.findFirst({ where: { id: taskId, studentId } });
    if (!existingTask) return res.status(404).json({ error: 'Task not found.' });

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        isComplete: req.body.isComplete,
        completedAt: req.body.isComplete ? new Date() : null,
      },
    });
    await refreshStudentSummary(studentId);
    res.json(task);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ error: 'Could not update this task.' });
  }
});

app.delete('/api/students/:studentId/tasks/:taskId', async (req, res) => {
  const studentId = parseId(req.params.studentId);
  const taskId = parseId(req.params.taskId);

  if (!studentId || !taskId) return res.status(400).json({ error: 'Invalid task or student ID.' });

  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, studentId } });
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    await prisma.task.delete({ where: { id: taskId } });
    await refreshStudentSummary(studentId);
    res.status(204).end();
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ error: 'Could not delete this task.' });
  }
});

app.patch('/api/students/:id', async (req, res) => {
  const studentId = parseId(req.params.id);
  if (!studentId) return res.status(400).json({ error: 'Invalid student ID.' });

  const data = {};
  if (typeof req.body.name === 'string' && req.body.name.trim()) data.name = req.body.name.trim();
  if (typeof req.body.school === 'string' && req.body.school.trim()) data.school = req.body.school.trim();
  if (!Object.keys(data).length) return res.status(400).json({ error: 'Enter a name or school to update.' });

  try {
    const student = await prisma.student.update({
      where: { id: studentId },
      data,
      select: { id: true, name: true, email: true, school: true, grade: true, engagement: true },
    });
    res.json(student);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Could not update your profile.' });
  }
});

// 🤖 3. AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { studentId, message } = req.body;

  try {
    await prisma.chatMessage.create({
      data: { studentId: parseInt(studentId), role: 'student', content: message }
    });

    const history = await prisma.chatMessage.findMany({
      where: { studentId: parseInt(studentId) },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

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

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "openai/gpt-oss-20b", // ✅ Standard free Groq model
      temperature: 0.7,
      max_tokens: 200,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I couldn't process that, try again!";

    await prisma.chatMessage.create({
      data: { studentId: parseInt(studentId), role: 'ai', content: aiResponse }
    });

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ error: "AI failed to respond." });
  }
});

// 🟢 4. Signup Endpoint (Now with Password Hashing)
app.post('/api/signup', async (req, res) => {
  const { name, email, password, school } = req.body;

  if (!name?.trim() || !email?.trim() || !password || !school?.trim()) {
    return res.status(400).json({ error: 'Name, email, password, and school are required.' });
  }
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const existingStudent = await prisma.student.findUnique({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // ✅ Hash the password

    const newStudent = await prisma.student.create({
      data: {
        name: name,
        email: email.trim().toLowerCase(),
        school: school.trim(),
        password: hashedPassword, // ✅ Save hashed password
        avatar: '⛏️',
        grade: 'N/A',
        engagement: 0,
        status: 'active',
        lastActive: 'Just now',
        trend: 'stable'
      }
    });

    // Return ID so frontend can save the session
    res.json({ id: newStudent.id, name: newStudent.name, email: newStudent.email, school: newStudent.school });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Failed to create account." });
  }
});

// 🟢 5. Login Endpoint (Verify Password)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await prisma.student.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Success! Send back the student data (this acts as our session)
    res.json({ id: student.id, name: student.name, email: student.email, school: student.school });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// 🟢 6. Get Personalized AI Insights (With "Cold Start" Fix)
app.get('/api/insights/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const student = await prisma.student.findUnique({ where: { id: studentId } });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    let prompt = "";


    if (student.engagement === 50 && student.grade === 'A' && student.status === 'active') {
      prompt = `You are an AI tutor. This is a brand new student named ${student.name}. 
      We don't have their grades or engagement data yet because they just signed up. 
      Instead of giving advice, just say a friendly welcome message, introduce yourself, and ask them: 
      'What classes are you taking this semester, and what are your goals?' 
      Return ONLY a valid JSON array (no markdown, no text outside the array) with this exact structure:
      [
        {
          "type": "recommendation", 
          "title": "Welcome to EduCraft!", 
          "description": "Your friendly welcome message here.", 
          "action": "Tell me about your classes", 
          "confidence": 100
        }
      ]`;
    } else {
      // ✅ EXISTING USER: We have real data to analyze
      prompt = `You are an AI tutor for a student named ${student.name}. 
      Here is their current data: Engagement is ${student.engagement}%, Grade is ${student.grade}, Status is ${student.status}.
      
      Generate exactly 3 personalized, encouraging insights for THIS STUDENT (do not mention other students). 
      Return ONLY a valid JSON array (no markdown, no text outside the array) with this exact structure:
      [
        {
          "type": "trend", 
          "title": "Short Title", 
          "description": "1-2 sentences about their progress", 
          "action": "A small task they can do", 
          "confidence": 85
        }
      ]`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);
    
    const insights = aiResponse.insights || aiResponse; 
    const finalInsights = Array.isArray(insights) ? insights : [insights];
    
    res.json(finalInsights.map(i => ({ ...i, timestamp: 'Just now' })));

  } catch (error) {
    console.error("Insights Error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`⛏️ EduCraft Server mining on http://localhost:${PORT}`);
});