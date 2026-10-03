import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Check, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { apiFetch, readApiJson } from '../api.js';
import { getCurrentStudentId } from '../session.js';
import '../styles/Tasks.css';

const emptyForm = { title: '', subject: '', dueAt: '' };

function formatDueAt(dueAt) {
  return new Date(dueAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const studentId = getCurrentStudentId();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(studentId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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
        const response = await apiFetch(`students/${studentId}`);
        const data = await readApiJson(response, 'Could not load your tasks.');
        setTasks(data.tasks || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [studentId]);

  const visibleTasks = tasks.filter((task) =>
    `${task.title} ${task.subject}`.toLowerCase().includes(search)
  );
  const completedCount = tasks.filter((task) => task.isComplete).length;

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const addTask = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const response = await apiFetch(`students/${studentId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dueAt: new Date(form.dueAt).toISOString(),
        }),
      });
      const task = await readApiJson(response, 'Could not save this task.');

      setTasks((current) => [task, ...current]);
      setForm(emptyForm);
      window.dispatchEvent(new Event('student-data-changed'));
      setNotice('Task added.');
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
      const response = await apiFetch(`students/${studentId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isComplete: !task.isComplete }),
      });
      const updatedTask = await readApiJson(response, 'Could not update this task.');
      setTasks((current) => current.map((item) => item.id === task.id ? updatedTask : item));
      window.dispatchEvent(new Event('student-data-changed'));
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setError('');
    setNotice('');
    try {
      const response = await apiFetch(`students/${studentId}/tasks/${task.id}`, { method: 'DELETE' });
      await readApiJson(response, 'Could not delete this task.');
      setTasks((current) => current.filter((item) => item.id !== task.id));
      window.dispatchEvent(new Event('student-data-changed'));
      setNotice('Task deleted.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const enableReminders = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      setNotificationPermission(await Notification.requestPermission());
    } catch {
      setNotificationPermission('denied');
    }
  };

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div>
          <h1 className="page-title"><ClipboardList aria-hidden="true" /> My Tasks</h1>
          <p className="page-subtitle">Add tasks, set a due time, and get a reminder when it’s time to start.</p>
        </div>
        <div className="task-counts" aria-live="polite">
          <span>{tasks.length} total</span>
          <span>{completedCount} done</span>
          {notificationPermission === 'default' && (
            <button className="task-notification-toggle" type="button" onClick={enableReminders}>
              <Bell size={15} /> Enable reminders
            </button>
          )}
          {notificationPermission === 'granted' && <span className="task-reminders-enabled"><Bell size={14} /> Reminders on</span>}
          {notificationPermission === 'denied' && <span>Page alerts on</span>}
        </div>
      </header>

      {error && <p className="task-message task-error" role="alert">{error}</p>}
      {notice && <p className="task-message task-notice" role="status">{notice}</p>}

      <section className="task-form-section" aria-labelledby="task-form-title">
        <h2 id="task-form-title">Add a task</h2>
        <form className="task-form" onSubmit={addTask}>
          <label className="task-field task-field-wide">
            <span>Task name</span>
            <input name="title" value={form.title} onChange={updateForm} placeholder="e.g. Practice mathematics" required maxLength={120} />
          </label>
          <label className="task-field">
            <span>Subject</span>
            <input name="subject" value={form.subject} onChange={updateForm} placeholder="e.g. Mathematics" required maxLength={80} />
          </label>
          <label className="task-field">
            <span>Remind me at</span>
            <input name="dueAt" type="datetime-local" value={form.dueAt} onChange={updateForm} required />
          </label>
          <button className="task-submit" type="submit" disabled={saving}>
            <Plus size={18} /> {saving ? 'Saving...' : 'Add task'}
          </button>
        </form>
      </section>

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
                  <p>{task.subject}{task.dueAt ? ` · Remind at ${formatDueAt(task.dueAt)}` : ''}</p>
                </div>
                <span className={`task-status ${task.isComplete ? 'task-status-done' : ''}`}>
                  {task.isComplete ? 'Completed' : 'To do'}
                </span>
                <button className="task-delete-btn" type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task)}>
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="task-empty">
            {search ? 'No tasks match this search.' : 'No tasks yet. Add a task and its reminder time above.'}
          </p>
        )}
      </section>
    </div>
  );
}