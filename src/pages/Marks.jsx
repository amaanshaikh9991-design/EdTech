import React, { useEffect, useState } from 'react';
import { BookOpenCheck, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { apiFetch, readApiJson } from '../api.js';
import { getCurrentStudentId } from '../session.js';
import '../styles/Marks.css';

const emptyForm = { subject: '', title: '', result: '' };

function formatResult(mark) {
  return `${mark.score} / ${mark.maxScore}`;
}

export default function Marks() {
  const studentId = getCurrentStudentId();
  const [marks, setMarks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(Boolean(studentId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(studentId ? '' : 'Sign in to manage your marks.');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!studentId) {
      return;
    }

    let active = true;
    const loadMarks = async () => {
      try {
        const response = await apiFetch(`students/${studentId}/marks`);
        const data = await readApiJson(response, 'Could not load your marks.');
        if (active) setMarks(data);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMarks();
    return () => { active = false; };
  }, [studentId]);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitMark = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const endpoint = editingId
        ? `students/${studentId}/marks/${editingId}`
        : `students/${studentId}/marks`;
      const response = await apiFetch(endpoint, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const mark = await readApiJson(response, editingId ? 'Could not update this mark.' : 'Could not save this mark.');
      setMarks((current) => editingId
        ? current.map((item) => item.id === mark.id ? mark : item)
        : [mark, ...current]);
      resetForm();
      window.dispatchEvent(new Event('student-data-changed'));
      setNotice(editingId ? 'Mark updated.' : 'Mark saved.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const editMark = (mark) => {
    setForm({ subject: mark.subject, title: mark.title, result: formatResult(mark) });
    setEditingId(mark.id);
    setError('');
    setNotice('');
    document.querySelector('.marks-entry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const deleteMark = async (mark) => {
    setError('');
    setNotice('');
    try {
      const response = await apiFetch(`students/${studentId}/marks/${mark.id}`, { method: 'DELETE' });
      await readApiJson(response, 'Could not delete this mark.');
      setMarks((current) => current.filter((item) => item.id !== mark.id));
      if (editingId === mark.id) resetForm();
      window.dispatchEvent(new Event('student-data-changed'));
      setNotice('Mark removed.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="marks-page">
      <header className="marks-header">
        <div>
          <h1 className="page-title"><BookOpenCheck aria-hidden="true" /> My Marks</h1>
          <p className="page-subtitle">Keep your subject results here, separate from your task list.</p>
        </div>
      </header>

      {error && <p className="marks-message marks-error" role="alert">{error}</p>}
      {notice && <p className="marks-message marks-notice" role="status">{notice}</p>}

      <section className="marks-entry" aria-labelledby="marks-entry-title">
        <h2 id="marks-entry-title">{editingId ? 'Update a result' : 'Add a result'}</h2>
        <form className="marks-form" onSubmit={submitMark}>
          <label>
            <span>Subject</span>
            <input name="subject" value={form.subject} onChange={updateForm} placeholder="e.g. Mathematics" maxLength={80} required />
          </label>
          <label>
            <span>Assessment</span>
            <input name="title" value={form.title} onChange={updateForm} placeholder="e.g. Algebra test" maxLength={120} required />
          </label>
<label>
  <span>Marks earned / total</span>

  <input
    name="result"
    type="text"
    value={form.result}
    onChange={updateForm}
    placeholder="e.g. 29 / 30"
    inputMode="text"
    pattern="\s*\d+(?:\.\d+)?\s*/\s*\d+(?:\.\d+)?\s*"
    title="Enter marks like 29 / 30"
    required
  />
</label>
          <div className="marks-form-actions">
            {editingId && (
              <button className="marks-cancel" type="button" onClick={resetForm} aria-label="Cancel mark edit" title="Cancel edit">
                <X size={17} />
              </button>
            )}
            <button className="marks-submit" type="submit" disabled={saving}>
              {editingId ? <Save size={17} /> : <Plus size={17} />}
              {saving ? 'Saving...' : editingId ? 'Update mark' : 'Save mark'}
            </button>
          </div>
        </form>
      </section>

      <section className="marks-list-section" aria-labelledby="marks-list-title">
        <div className="marks-list-heading">
          <h2 id="marks-list-title">Recorded results</h2>
          <span>{marks.length} {marks.length === 1 ? 'result' : 'results'}</span>
        </div>
        {loading ? <p className="marks-empty">Loading your marks...</p> : marks.length ? (
          <div className="marks-list">
            {marks.map((mark) => (
              <article className="mark-row" key={mark.id}>
                <div className="mark-subject">
                  <strong>{mark.subject}</strong>
                  <span>{mark.title}</span>
                </div>
                <div className="mark-score">
                  <strong>{formatResult(mark)}</strong>
                  <span>{Math.round((mark.score / mark.maxScore) * 100)}%</span>
                </div>
                <div className="mark-actions">
                  <button className="mark-edit" type="button" onClick={() => editMark(mark)} aria-label={`Edit ${mark.subject} mark`} title="Edit mark">
                    <Pencil size={16} />
                  </button>
                  <button className="mark-delete" type="button" onClick={() => deleteMark(mark)} aria-label={`Delete ${mark.subject} mark`} title="Delete mark">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="marks-empty">No marks recorded yet. Add a result above to see it in Dashboard, Analytics, Profile, and AI Insights.</p>}
      </section>
    </div>
  );
}
