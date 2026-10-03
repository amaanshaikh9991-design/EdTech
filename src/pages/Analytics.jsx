import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { apiFetch, readApiJson } from '../api.js';
import { getCurrentStudentId } from '../session.js';
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
  const studentId = getCurrentStudentId();
  const [tasks, setTasks] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(Boolean(studentId));
  const [error, setError] = useState(studentId ? '' : 'Sign in to see your analytics.');
  const [marksError, setMarksError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await apiFetch(`students/${studentId}`);
        const data = await readApiJson(response, 'Could not load your analytics.');
        setTasks(data.tasks || []);
        try {
          const marksResponse = await apiFetch(`students/${studentId}/marks`);
          setMarks(await readApiJson(marksResponse, 'Could not load your marks.'));
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

    if (studentId) loadAnalytics();
  }, [studentId]);

  useEffect(() => {
    const refresh = () => {
      apiFetch(`students/${studentId}`)
        .then((response) => readApiJson(response, 'Could not refresh your tasks.'))
        .then((data) => setTasks(data.tasks || []))
        .catch(() => {});
      apiFetch(`students/${studentId}/marks`)
        .then((response) => readApiJson(response, 'Could not refresh marks.'))
        .then((data) => { setMarks(data); setMarksError(''); })
        .catch((loadError) => setMarksError(loadError.message));
    };
    window.addEventListener('student-data-changed', refresh);
    return () => window.removeEventListener('student-data-changed', refresh);
  }, [studentId]);

  const completedTasks = tasks.filter((task) => task.isComplete);
  const taskStatus = [
    { name: 'Completed', value: completedTasks.length, color: '#4ade80' },
    { name: 'To do', value: tasks.length - completedTasks.length, color: '#fbbf24' },
  ].filter((item) => item.value > 0);
  const subjectMarks = Object.values(marks.reduce((subjects, mark) => {
    const current = subjects[mark.subject] || { subject: mark.subject, earned: 0, possible: 0 };
    current.earned += mark.score;
    current.possible += mark.maxScore;
    subjects[mark.subject] = current;
    return subjects;
  }, {}));
  const markHistory = [...marks]
    .sort((first, second) => new Date(first.markedAt) - new Date(second.markedAt))
    .map((mark) => ({
      name: `${mark.subject}: ${mark.title || 'Assessment'}`,
      score: mark.score,
      maxScore: mark.maxScore,
    }));
  const taskSubjects = Object.values(tasks.reduce((subjects, task) => {
    const current = subjects[task.subject] || { subject: task.subject, completed: 0, pending: 0 };
    if (task.isComplete) current.completed += 1;
    else current.pending += 1;
    subjects[task.subject] = current;
    return subjects;
  }, {}));

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Analytics</h1>
          <p className="page-subtitle">Your saved marks and task progress, shown separately.</p>
        </div>
      </div>

      {error && <p className="analytics-empty" role="alert">{error}</p>}
      {!error && !loading && (
        <div className="analytics-summary" aria-live="polite">
          <div><strong>{marks.length}</strong><span>Assessment marks recorded</span></div>
          <div><strong>{completedTasks.length}</strong><span>Tasks completed</span></div>
          <div><strong>{tasks.length - completedTasks.length}</strong><span>Tasks to do</span></div>
        </div>
      )}

      <div className="analytics-grid">
        <section className="chart-card">
          <h2 className="chart-title">Actual marks by subject</h2>
          {loading ? <p className="analytics-empty">Loading your marks...</p> : subjectMarks.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectMarks}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                <XAxis dataKey="subject" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip {...chartStyle} />
                <Bar dataKey="earned" fill="#4ade80" name="Marks earned" />
                <Bar dataKey="possible" fill="#60a5fa" name="Maximum marks" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="analytics-empty">{marksError || 'Record a mark to see subject results.'}</p>}
        </section>

        <section className="chart-card">
          <h2 className="chart-title">Task completion</h2>
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
          <h2 className="chart-title">Marks by assessment</h2>
          {loading ? <p className="analytics-empty">Loading your marks...</p> : markHistory.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={markHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip {...chartStyle} />
                <Line type="monotone" dataKey="score" stroke="#4ade80" strokeWidth={3} dot={{ fill: '#4ade80', r: 5 }} name="Marks earned" />
                <Line type="monotone" dataKey="maxScore" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} name="Maximum marks" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="analytics-empty">{marksError || 'Recorded results will appear here.'}</p>}
        </section>

        <section className="chart-card chart-full">
          <h2 className="chart-title">Tasks by subject</h2>
          {loading ? <p className="analytics-empty">Loading your tasks...</p> : taskSubjects.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={taskSubjects}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                <XAxis dataKey="subject" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip {...chartStyle} />
                <Bar dataKey="completed" stackId="tasks" fill="#4ade80" name="Completed" />
                <Bar dataKey="pending" stackId="tasks" fill="#fbbf24" name="To do" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="analytics-empty">Your subject task breakdown will appear here.</p>}
        </section>
      </div>
    </div>
  );
}