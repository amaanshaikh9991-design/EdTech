import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Check, ClipboardList, Play, Plus, Timer, Trash2, X } from 'lucide-react';
import { apiUrl } from '../api.js';
import '../styles/Tasks.css';

function getGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

function getResult(task) {
  const percentage = (task.score / task.maxScore) * 100;
  if (task.resultFormat === 'points') return `${task.score} / ${task.maxScore} points`;
  if (task.resultFormat === 'grade') return `${getGrade(percentage)} (${percentage.toFixed(1)}%)`;
  return `${percentage.toFixed(1)}%`;
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const emptyForm = {
  title: '',
  subject: '',
  score: '',
  maxScore: '100',
  resultFormat: 'percentage',
  dueAt: '',
  timerMinutes: '',
};

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const studentId = localStorage.getItem('currentStudentId');
  const timerStorageKey = `taskTimers:${studentId}`;
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [timers, setTimers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(timerStorageKey) || '{}');
    } catch {
      return {};
    }
  });
  const [timerMinutes, setTimerMinutes] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [notificationPermission, setNotificationPermission] = useState(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const search = (searchParams.get('q') || '').trim().toLowerCase();

  useEffect(() => {
    const loadTasks = async () => {
      if (!studentId) {
        setError('Sign in to manage your tasks.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(apiUrl(`students/${studentId}`));
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load your tasks.');
        setTasks(data.tasks || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [studentId]);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(timerStorageKey, JSON.stringify(timers));
  }, [timerStorageKey, timers]);

  useEffect(() => {
    const expired = Object.entries(timers).filter(([, timer]) => !timer.alerted && timer.endsAt <= currentTime);
    if (!expired.length || !tasks.length) return;

    const updatedTimers = { ...timers };
    const expiredTasks = [];
    for (const [taskId, timer] of expired) {
      const task = tasks.find((item) => String(item.id) === taskId);
      if (!task || task.isComplete) continue;
      updatedTimers[taskId] = { ...timer, alerted: true };
      expiredTasks.push(task);
    }

    if (!expiredTasks.length) return;
    localStorage.setItem(timerStorageKey, JSON.stringify(updatedTimers));
    setTimers(updatedTimers);
    const titles = expiredTasks.map((task) => task.title).join(', ');
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Task timer finished', { body: titles });
    } else {
      window.alert(`Timer finished for: ${titles}`);
    }
  }, [currentTime, tasks, timerStorageKey, timers]);

  const visibleTasks = tasks.filter((task) =>
    `${task.title} ${task.subject}`.toLowerCase().includes(search)
  );
  const completedCount = tasks.filter((task) => task.isComplete).length;

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const clearTimer = (taskId) => {
    setTimers((current) => {
      const next = { ...current };
      delete next[taskId];
      return next;
    });
  };

  const addTask = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const response = await fetch(apiUrl(`students/${studentId}/tasks`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          subject: form.subject,
          score: Number(form.score),
          maxScore: Number(form.maxScore),
          resultFormat: form.resultFormat,
          dueAt: form.dueAt,
        }),
      });
      const task = await response.json();
      if (!response.ok) throw new Error(task.error || 'Could not save this task.');

      setTasks((current) => [task, ...current]);
      const minutes = Number(form.timerMinutes);
      if (Number.isFinite(minutes) && minutes > 0) {
        setTimers((current) => ({
          ...current,
          [task.id]: { endsAt: Date.now() + minutes * 60_000, alerted: false },
        }));
      }
      setForm(emptyForm);
      setNotice('Task saved.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task) => {
    setError('');
    setNotice('');
    try {
      const response = await fetch(apiUrl(`students/${studentId}/tasks/${task.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isComplete: !task.isComplete }),
      });
      const updatedTask = await response.json();
      if (!response.ok) throw new Error(updatedTask.error || 'Could not update this task.');
      setTasks((current) => current.map((item) => item.id === task.id ? updatedTask : item));
      if (updatedTask.isComplete) clearTimer(task.id);
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setError('');
    setNotice('');
    try {
      const response = await fetch(apiUrl(`students/${studentId}/tasks/${task.id}`), { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not delete this task.');
      }
      setTasks((current) => current.filter((item) => item.id !== task.id));
      clearTimer(task.id);
      setNotice('Task deleted.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const startTimer = (task) => {
    const minutes = Number(timerMinutes[task.id] || 25);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) {
      setError('Choose a timer duration between 1 minute and 24 hours.');
      return;
    }
    setError('');
    setTimers((current) => ({
      ...current,
      [task.id]: { endsAt: Date.now() + minutes * 60_000, alerted: false },
    }));
  };

  const enableNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch {
      setNotificationPermission('denied');
    }
  };

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div>
          <h1 className="page-title"><ClipboardList aria-hidden="true" /> My Tasks</h1>
          <p className="page-subtitle">Track your assignments and recorded marks.</p>
        </div>
        <div className="task-counts" aria-live="polite">
          <span>{tasks.length} total</span>
          <span>{completedCount} done</span>
          {notificationPermission !== 'unsupported' && notificationPermission !== 'granted' && (
            <button className="task-notification-toggle" type="button" onClick={enableNotifications}>
              <Bell size={15} /> Enable alerts
            </button>
          )}
          {notificationPermission === 'granted' && <span><Bell size={14} /> Alerts on</span>}
        </div>
      </header>

      <section className="task-form-section" aria-labelledby="task-form-title">
        <h2 id="task-form-title">Add a task</h2>
        <form className="task-form" onSubmit={addTask}>
          <label className="task-field task-field-wide">
            <span>Task name</span>
            <input name="title" value={form.title} onChange={updateForm} placeholder="e.g. Algebra chapter test" required maxLength={120} />
          </label>
          <label className="task-field">
            <span>Subject</span>
            <input name="subject" value={form.subject} onChange={updateForm} placeholder="e.g. Mathematics" required maxLength={80} />
          </label>
          <label className="task-field">
            <span>Marks earned</span>
            <input name="score" type="number" value={form.score} onChange={updateForm} min="0" step="any" required />
          </label>
          <label className="task-field">
            <span>Out of</span>
            <input name="maxScore" type="number" value={form.maxScore} onChange={updateForm} min="0.01" step="any" required />
          </label>
          <label className="task-field">
            <span>Show result as</span>
            <select name="resultFormat" value={form.resultFormat} onChange={updateForm}>
              <option value="percentage">Percentage</option>
              <option value="grade">Letter grade</option>
              <option value="points">Points</option>
            </select>
          </label>
          <label className="task-field">
            <span>Due date <small>(optional)</small></span>
            <input name="dueAt" type="date" value={form.dueAt} onChange={updateForm} />
          </label>
          <label className="task-field">
            <span>Focus timer <small>(optional, minutes)</small></span>
            <input name="timerMinutes" type="number" value={form.timerMinutes} onChange={updateForm} min="1" max="1440" placeholder="e.g. 25" />
          </label>
          <button className="task-submit" type="submit" disabled={saving}>
            <Plus size={18} /> {saving ? 'Saving...' : 'Add task'}
          </button>
        </form>
      </section>

      {error && <p className="task-message task-error" role="alert">{error}</p>}
      {notice && <p className="task-message task-notice" role="status">{notice}</p>}

      <section className="task-list-section" aria-labelledby="task-list-title">
        <h2 id="task-list-title">Your work</h2>
        {loading ? (
          <p className="task-empty">Loading your tasks...</p>
        ) : visibleTasks.length ? (
          <div className="task-list">
            {visibleTasks.map((task) => (
              <article className={`task-item ${task.isComplete ? 'is-complete' : ''}`} key={task.id}>
                <button
                  className="task-complete-btn"
                  type="button"
                  aria-label={task.isComplete ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
                  aria-pressed={task.isComplete}
                  onClick={() => toggleTask(task)}
                >
                  {task.isComplete && <Check size={18} />}
                </button>
                <div className="task-details">
                  <h3>{task.title}</h3>
                  <p>{task.subject}{task.dueAt ? ` · Due ${new Date(task.dueAt).toLocaleDateString()}` : ''}</p>
                </div>
                <div className="task-timer-controls">
                  <span className={`task-timer-readout ${timers[task.id] && timers[task.id].endsAt <= currentTime ? 'timer-expired' : ''}`}>
                    <Timer size={14} />
                    {timers[task.id]
                      ? timers[task.id].endsAt <= currentTime ? 'Time is up' : formatCountdown(timers[task.id].endsAt - currentTime)
                      : 'No timer'}
                  </span>
                  {!task.isComplete && (
                    <>
                      <label className="task-timer-minutes">
                        <span className="visually-hidden">Timer minutes for {task.title}</span>
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={timerMinutes[task.id] ?? '25'}
                          onChange={(event) => setTimerMinutes((current) => ({ ...current, [task.id]: event.target.value }))}
                          aria-label={`Timer minutes for ${task.title}`}
                        />
                      </label>
                      <button className="task-timer-btn" type="button" onClick={() => startTimer(task)} aria-label={`${timers[task.id] ? 'Restart' : 'Start'} timer for ${task.title}`} title="Start or restart timer">
                        <Play size={15} />
                      </button>
                      {timers[task.id] && (
                        <button className="task-timer-clear" type="button" onClick={() => clearTimer(task.id)} aria-label={`Clear timer for ${task.title}`} title="Clear timer">
                          <X size={15} />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="task-result">
                  <strong>{getResult(task)}</strong>
                  <span>{task.isComplete ? 'Completed' : 'In progress'}</span>
                </div>
                <button className="task-delete-btn" type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task)}>
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="task-empty">
            {search ? 'No tasks match this search.' : 'No tasks yet. Add your first task above to start tracking your progress.'}
          </p>
        )}
      </section>
    </div>
  );
}