import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, ClipboardList, Plus, Trash2 } from 'lucide-react';
import '../styles/Tasks.css';

const api = 'http://localhost:4000/api';

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

const emptyForm = {
  title: '',
  subject: '',
  score: '',
  maxScore: '100',
  resultFormat: 'percentage',
  dueAt: '',
};

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const studentId = localStorage.getItem('currentStudentId');
  const search = (searchParams.get('q') || '').trim().toLowerCase();

  useEffect(() => {
    const loadTasks = async () => {
      if (!studentId) {
        setError('Sign in to manage your tasks.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${api}/students/${studentId}`);
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

  const visibleTasks = tasks.filter((task) =>
    `${task.title} ${task.subject}`.toLowerCase().includes(search)
  );

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const addTask = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const response = await fetch(`${api}/students/${studentId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, score: Number(form.score), maxScore: Number(form.maxScore) }),
      });
      const task = await response.json();
      if (!response.ok) throw new Error(task.error || 'Could not save this task.');

      setTasks((current) => [task, ...current]);
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
      const response = await fetch(`${api}/students/${studentId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isComplete: !task.isComplete }),
      });
      const updatedTask = await response.json();
      if (!response.ok) throw new Error(updatedTask.error || 'Could not update this task.');
      setTasks((current) => current.map((item) => item.id === task.id ? updatedTask : item));
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${api}/students/${studentId}/tasks/${task.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not delete this task.');
      }
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setNotice('Task deleted.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const completedCount = tasks.filter((task) => task.isComplete).length;

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