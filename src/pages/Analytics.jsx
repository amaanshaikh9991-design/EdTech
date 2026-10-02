import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { apiUrl } from '../api.js';
import '../styles/Analytics.css';

const chartStyle = {
  contentStyle: {
    background: '#1e293b',
    border: '2px solid #4ade80',
    borderRadius: '2px',
    fontFamily: 'MinecraftRegular, monospace',
    color: '#f1f5f9',
  },
};

export default function Analytics() {
  const studentId = localStorage.getItem('currentStudentId');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(Boolean(studentId));
  const [error, setError] = useState(studentId ? '' : 'Sign in to see your analytics.');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(apiUrl(`students/${studentId}`));
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load your analytics.');
        setTasks(data.tasks || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) loadTasks();
  }, [studentId]);

  const completedTasks = tasks.filter((task) => task.isComplete);
  const taskStatus = [
    { name: 'Completed', value: completedTasks.length, color: '#4ade80' },
    { name: 'In progress', value: tasks.length - completedTasks.length, color: '#fbbf24' },
  ].filter((item) => item.value > 0);
  const subjectStats = Object.values(tasks.reduce((subjects, task) => {
    const current = subjects[task.subject] || { subject: task.subject, score: 0, maxScore: 0, completed: 0, pending: 0 };
    if (task.isComplete) {
      current.score += task.score;
      current.maxScore += task.maxScore;
      current.completed += 1;
    } else {
      current.pending += 1;
    }
    subjects[task.subject] = current;
    return subjects;
  }, {})).map((subject) => ({
    ...subject,
    average: subject.maxScore ? Math.round((subject.score / subject.maxScore) * 100) : 0,
  }));
  const assessmentScores = [...completedTasks]
    .sort((first, second) => new Date(first.completedAt) - new Date(second.completedAt))
    .map((task) => ({
      name: task.title.length > 20 ? `${task.title.slice(0, 19)}...` : task.title,
      percentage: Math.round((task.score / task.maxScore) * 100),
    }));
  const totalPossible = completedTasks.reduce((sum, task) => sum + task.maxScore, 0);
  const averageMark = totalPossible
    ? Math.round((completedTasks.reduce((sum, task) => sum + task.score, 0) / totalPossible) * 100)
    : null;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Analytics</h1>
          <p className="page-subtitle">Your marks and task progress, from your own records.</p>
        </div>
      </div>

      {error && <p className="analytics-empty" role="alert">{error}</p>}
      {!error && !loading && (
        <div className="analytics-summary" aria-live="polite">
          <div><strong>{averageMark === null ? '—' : `${averageMark}%`}</strong><span>Average mark</span></div>
          <div><strong>{completedTasks.length}</strong><span>Tasks completed</span></div>
          <div><strong>{tasks.length - completedTasks.length}</strong><span>In progress</span></div>
        </div>
      )}

      <div className="analytics-grid">
        <section className="chart-card">
          <h2 className="chart-title">📚 Average Mark by Subject</h2>
          {loading ? <p className="analytics-empty">Loading your marks...</p> : subjectStats.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                <XAxis dataKey="subject" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip {...chartStyle} />
                <Bar dataKey="average" fill="#4ade80" radius={[2, 2, 0, 0]} name="Average mark %" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="analytics-empty">Subject results appear after you complete a task with marks.</p>}
        </section>

        <section className="chart-card">
          <h2 className="chart-title">✅ Task Completion</h2>
          {loading ? <p className="analytics-empty">Loading your tasks...</p> : taskStatus.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={taskStatus} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {taskStatus.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />)}
                </Pie>
                <Tooltip {...chartStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="analytics-empty">Add tasks to see your completion breakdown.</p>}
        </section>

        <section className="chart-card chart-full">
          <h2 className="chart-title">📝 Marks by Completed Task</h2>
          {loading ? <p className="analytics-empty">Loading your marks...</p> : assessmentScores.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={assessmentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip {...chartStyle} />
                <Line type="monotone" dataKey="percentage" stroke="#60a5fa" strokeWidth={3} dot={{ fill: '#4ade80', r: 5 }} name="Mark %" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="analytics-empty">Completed task marks will appear here.</p>}
        </section>

        <section className="chart-card chart-full">
          <h2 className="chart-title">📋 Tasks by Subject</h2>
          {loading ? <p className="analytics-empty">Loading your tasks...</p> : subjectStats.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                <XAxis dataKey="subject" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip {...chartStyle} />
                <Bar dataKey="completed" stackId="tasks" fill="#4ade80" name="Completed" />
                <Bar dataKey="pending" stackId="tasks" fill="#fbbf24" name="In progress" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="analytics-empty">Your subject task breakdown will appear here.</p>}
        </section>
      </div>
    </div>
  );
}