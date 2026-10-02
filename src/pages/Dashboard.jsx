import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, BookOpen, Bot, Award, ClipboardList } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import StatCard from '../components/StatCard';
import { apiUrl } from '../api.js';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const studentId = localStorage.getItem('currentStudentId');

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch(apiUrl(`students/${studentId}`));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load your dashboard.');
        setStudent(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [navigate, studentId]);

  const tasks = student?.tasks || [];
  const completedTasks = tasks.filter((task) => task.isComplete);
  const pendingTasks = tasks.length - completedTasks.length;
  const totalPossible = completedTasks.reduce((sum, task) => sum + task.maxScore, 0);
  const averageMark = totalPossible
    ? Math.round((completedTasks.reduce((sum, task) => sum + task.score, 0) / totalPossible) * 100)
    : null;
  const completionRate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const taskStatus = [
    { name: 'Completed', value: completedTasks.length, color: '#4ade80' },
    { name: 'In progress', value: pendingTasks, color: '#fbbf24' },
  ].filter((item) => item.value > 0);
  const subjectPerformance = Object.values(completedTasks.reduce((subjects, task) => {
    const current = subjects[task.subject] || { subject: task.subject, score: 0, maxScore: 0 };
    current.score += task.score;
    current.maxScore += task.maxScore;
    subjects[task.subject] = current;
    return subjects;
  }, {})).map((subject) => ({
    subject: subject.subject,
    average: Math.round((subject.score / subject.maxScore) * 100),
  }));
  const scoreHistory = [...completedTasks]
    .sort((first, second) => new Date(first.completedAt) - new Date(second.completedAt))
    .map((task) => ({
      task: task.title.length > 16 ? `${task.title.slice(0, 15)}...` : task.title,
      percentage: Math.round((task.score / task.maxScore) * 100),
    }));
  const recentTasks = [...tasks].sort((first, second) =>
    new Date(second.updatedAt) - new Date(first.updatedAt)
  ).slice(0, 4);

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 className="page-title">⛏️ Loading your world...</h2>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-page"><p className="dashboard-empty" role="alert">{error}</p></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎒 My Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {student?.name || 'Student'}! Ready to level up your learning?
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="live-indicator">
            <span className="live-dot"></span>
            LIVE
          </span>
          <button className="task-btn" onClick={() => navigate('/tasks')}>
            <ClipboardList size={18} />
            Manage tasks
          </button>
          <button className="ai-btn" onClick={() => navigate('/chat')}>
            <Bot size={18} style={{ marginRight: '8px' }} /> Talk to AI Tutor
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={TrendingUp}
          label="Average Mark"
          value={averageMark === null ? '—' : `${averageMark}%`}
          change={`${averageMark || 0}%`}
          color={averageMark >= 80 ? 'green' : 'orange'}
        />
        <StatCard
          icon={Award}
          label="Current Grade"
          value={completedTasks.length ? student?.grade : '—'}
          change={`${averageMark || 0}%`}
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Action Needed"
          value={pendingTasks}
          change={`${tasks.length ? Math.round((pendingTasks / tasks.length) * 100) : 0}%`}
          color="orange"
        />
        <StatCard
          icon={BookOpen}
          label="Completion Rate"
          value={`${completionRate}%`}
          change={`${completionRate}%`}
          color="green"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-wide">
          <h3 className="chart-title">My Assessment Scores</h3>
          {scoreHistory.length ? <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={scoreHistory}>
              <defs>
                <linearGradient id="submissionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
              <XAxis dataKey="task" stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '2px solid #4ade80',
                  borderRadius: '2px',
                  fontFamily: 'MinecraftRegular, monospace',
                  color: '#f1f5f9'
                }}
              />
              <Area type="monotone" dataKey="percentage" stroke="#4ade80" fill="url(#submissionsGrad)" strokeWidth={2} name="Mark %" />
            </AreaChart>
          </ResponsiveContainer> : <p className="dashboard-empty">Complete tasks with marks to see your score history.</p>}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">📋 Task Status</h3>
          {taskStatus.length ? <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={taskStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: '#64748b' }}
              >
                {taskStatus.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '2px solid #4ade80',
                  borderRadius: '2px',
                  fontFamily: 'MinecraftRegular, monospace',
                  color: '#f1f5f9'
                }}
              />
            </PieChart>
          </ResponsiveContainer> : <p className="dashboard-empty">Add a task to start tracking your work.</p>}
        </div>
      </div>

      <div className="bottom-grid">
        <div className="chart-card">
          <h3 className="chart-title">📊 Marks by Subject</h3>
          {subjectPerformance.length ? <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectPerformance} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
              <XAxis dataKey="subject" stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '2px solid #4ade80',
                  borderRadius: '2px',
                  fontFamily: 'MinecraftRegular, monospace',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="average" fill="#4ade80" radius={[2, 2, 0, 0]} name="Average mark %" />
            </BarChart>
          </ResponsiveContainer> : <p className="dashboard-empty">Subject results will appear after you complete a marked task.</p>}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">🔔 Recent Tasks</h3>
          <div className="alerts-list">
            {recentTasks.length ? recentTasks.map((task) => (
              <div key={task.id} className={`alert-item alert-${task.isComplete ? 'info' : 'warning'}`}>
                <div className={`alert-dot alert-dot-${task.isComplete ? 'info' : 'warning'}`}></div>
                <div className="alert-content">
                  <span className="alert-student">{task.title}</span>
                  <span className="alert-message">{task.subject} · {task.isComplete ? 'Completed' : 'In progress'}</span>
                </div>
                <span className="alert-time">{task.isComplete ? `${Math.round((task.score / task.maxScore) * 100)}%` : 'Open'}</span>
              </div>
            )) : (
              <p className="dashboard-empty">Your tasks will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}