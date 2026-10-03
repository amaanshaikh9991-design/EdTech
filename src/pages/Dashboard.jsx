import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BookOpenCheck, ClipboardList, Clock3, ListTodo } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import StatCard from '../components/StatCard';
import { apiFetch, readApiJson } from '../api.js';
import { getCurrentStudentId } from '../session.js';
import '../styles/Dashboard.css';

const chartStyle = {
  contentStyle: {
    background: '#1e293b',
    border: '2px solid #4ade80',
    borderRadius: '2px',
    fontFamily: 'MinecraftRegular, monospace',
    color: '#f1f5f9',
  },
};

function formatDueAt(dueAt) {
  return new Date(dueAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const studentId = getCurrentStudentId();
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [marksError, setMarksError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        setError('Your session is missing or expired. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await apiFetch(`students/${studentId}`);
        const data = await readApiJson(response, 'Could not load your dashboard.');
        setStudent(data);
        try {
          const marksResponse = await apiFetch(`students/${studentId}/marks`);
          setMarks(await readApiJson(marksResponse, 'Could not load marks.'));
          setMarksError('');
        } catch (marksLoadError) {
          setMarksError(marksLoadError.message);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate, studentId]);

  useEffect(() => {
    const refreshDashboard = () => {
      apiFetch(`students/${studentId}`)
        .then((response) => readApiJson(response, 'Could not refresh your dashboard.'))
        .then((data) => setStudent(data))
        .catch(() => {});
      apiFetch(`students/${studentId}/marks`)
        .then((response) => readApiJson(response, 'Could not refresh marks.'))
        .then((data) => { setMarks(data); setMarksError(''); })
        .catch((loadError) => setMarksError(loadError.message));
    };
    window.addEventListener('student-data-changed', refreshDashboard);
    return () => window.removeEventListener('student-data-changed', refreshDashboard);
  }, [studentId]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    const initialClock = window.setTimeout(() => setNow(Date.now()), 0);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initialClock);
    };
  }, []);

  const tasks = student?.tasks || [];
  const completedTasks = tasks.filter((task) => task.isComplete);
  const completionRate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const taskStatus = [
    { name: 'Completed', value: completedTasks.length, color: '#4ade80' },
    { name: 'To do', value: tasks.length - completedTasks.length, color: '#fbbf24' },
  ].filter((item) => item.value > 0);
  const subjectMarks = Object.values(marks.reduce((subjects, mark) => {
    const subject = subjects[mark.subject] || { subject: mark.subject, earned: 0, possible: 0 };
    subject.earned += mark.score;
    subject.possible += mark.maxScore;
    subjects[mark.subject] = subject;
    return subjects;
  }, {}));
  const actionTasks = tasks
    .filter((task) => now && !task.isComplete && task.dueAt && new Date(task.dueAt).getTime() <= now + 24 * 60 * 60 * 1000)
    .sort((first, second) => new Date(first.dueAt) - new Date(second.dueAt));
  const recentTasks = [...tasks].sort((first, second) =>
    new Date(second.updatedAt) - new Date(first.updatedAt)
  ).slice(0, 5);
  const recentMarks = marks.slice(0, 5);

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
          <p className="page-subtitle">Welcome back, {student?.name || 'Student'}.</p>
        </div>
        <div className="header-actions">
          <button className="task-btn" onClick={() => navigate('/tasks')}>
            <ClipboardList size={18} /> Manage tasks
          </button>
          <button className="marks-btn" onClick={() => navigate('/marks')}>
            <BookOpenCheck size={18} /> Record marks
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={ListTodo} label="Tasks assigned" value={tasks.length} change={tasks.length ? '100%' : '0%'} color="blue" />
        <StatCard icon={AlertTriangle} label="Due within 24 hours" value={actionTasks.length} change={actionTasks.length ? '100%' : '0%'} color="orange" />
        <StatCard icon={ClipboardList} label="Completion rate" value={`${completionRate}%`} change={`${completionRate}%`} color="green" />
        <StatCard icon={BookOpenCheck} label="Marks recorded" value={marks.length} change={marks.length ? '100%' : '0%'} color="blue" />
      </div>

      <div className="charts-grid">
        <section className="chart-card" aria-labelledby="task-status-title">
          <h2 className="chart-title" id="task-status-title">Task status</h2>
          {taskStatus.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={taskStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {taskStatus.map((item) => <Cell key={item.name} fill={item.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={chartStyle.contentStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="dashboard-empty">Add a task to start tracking completion.</p>}
        </section>

        <section className="chart-card" aria-labelledby="subject-marks-title">
          <h2 className="chart-title" id="subject-marks-title">Actual marks by subject</h2>
          {subjectMarks.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectMarks}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                <XAxis dataKey="subject" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip contentStyle={chartStyle.contentStyle} />
                <Bar dataKey="earned" fill="#4ade80" name="Marks earned" />
                <Bar dataKey="possible" fill="#60a5fa" name="Maximum marks" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="dashboard-empty">{marksError || 'Record a result to see your subject marks here.'}</p>}
        </section>
      </div>

      <div className="bottom-grid">
        <section className="chart-card" aria-labelledby="action-needed-title">
          <h2 className="chart-title" id="action-needed-title"><Clock3 size={17} /> Action needed</h2>
          <div className="alerts-list">
            {actionTasks.length ? actionTasks.map((task) => {
              const overdue = new Date(task.dueAt).getTime() < now;
              return (
                <div key={task.id} className={`alert-item alert-${overdue ? 'critical' : 'warning'}`}>
                  <div className={`alert-dot alert-dot-${overdue ? 'critical' : 'warning'}`} />
                  <div className="alert-content">
                    <strong className="alert-student">{task.title}</strong>
                    <span className="alert-message">{overdue ? 'Overdue, please complete this task' : 'Due within 24 hours'} · {task.subject}</span>
                  </div>
                  <time className="alert-time" dateTime={task.dueAt}>{formatDueAt(task.dueAt)}</time>
                </div>
              );
            }) : <p className="dashboard-empty dashboard-empty-compact">No overdue or near-due tasks.</p>}
          </div>
        </section>

        <section className="chart-card" aria-labelledby="recent-tasks-title">
          <h2 className="chart-title" id="recent-tasks-title">My tasks</h2>
          <div className="alerts-list">
            {recentTasks.length ? recentTasks.map((task) => (
              <div key={task.id} className={`alert-item alert-${task.isComplete ? 'info' : 'warning'}`}>
                <div className={`alert-dot alert-dot-${task.isComplete ? 'info' : 'warning'}`} />
                <div className="alert-content">
                  <strong className="alert-student">{task.title}</strong>
                  <span className="alert-message">{task.subject} · {task.isComplete ? 'Completed' : 'To do'}</span>
                </div>
                {task.dueAt && <time className="alert-time" dateTime={task.dueAt}>{formatDueAt(task.dueAt)}</time>}
              </div>
            )) : <p className="dashboard-empty dashboard-empty-compact">Your tasks will appear here.</p>}
          </div>
        </section>

        <section className="chart-card chart-card-full" aria-labelledby="recent-marks-title">
          <h2 className="chart-title" id="recent-marks-title">Recent marks</h2>
          <div className="alerts-list">
            {recentMarks.length ? recentMarks.map((mark) => (
              <div key={mark.id} className="alert-item alert-info">
                <div className="alert-dot alert-dot-info" />
                <div className="alert-content">
                  <strong className="alert-student">{mark.subject}</strong>
                  <span className="alert-message">{mark.title || 'Assessment'}</span>
                </div>
                <strong className="mark-dashboard-score">{mark.score} / {mark.maxScore}</strong>
              </div>
            )) : <p className="dashboard-empty dashboard-empty-compact">{marksError || 'Your saved assessment marks will appear here.'}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}