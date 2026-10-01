import React, { useEffect, useState } from 'react';
import { GraduationCap, Save, UserRound } from 'lucide-react';
import '../styles/Profile.css';

const api = 'http://localhost:4000/api';

export default function Profile({ onProfileUpdated }) {
  const studentId = localStorage.getItem('currentStudentId');
  const [profile, setProfile] = useState({ name: '', email: '', school: '', grade: 'N/A', engagement: 0, tasks: [] });
  const [form, setForm] = useState({ name: '', school: '' });
  const [loading, setLoading] = useState(Boolean(studentId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${api}/students/${studentId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load your profile.');
        setProfile(data);
        setForm({ name: data.name || '', school: data.school || '' });
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) loadProfile();
  }, [studentId]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const response = await fetch(`${api}/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update your profile.');
      setProfile((current) => ({ ...current, ...data }));
      setForm({ name: data.name, school: data.school || '' });
      localStorage.setItem('currentStudentName', data.name);
      onProfileUpdated?.(data);
      setNotice('Profile updated.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const tasks = profile.tasks || [];
  const completedTasks = tasks.filter((task) => task.isComplete);
  const completed = completedTasks.length;
  const totalPossible = completedTasks.reduce((sum, task) => sum + task.maxScore, 0);
  const averageMark = totalPossible
    ? Math.round((completedTasks.reduce((sum, task) => sum + task.score, 0) / totalPossible) * 100)
    : null;
  const grade = averageMark === null
    ? 'N/A'
    : averageMark >= 90 ? 'A' : averageMark >= 80 ? 'B' : averageMark >= 70 ? 'C' : averageMark >= 60 ? 'D' : 'F';

  if (loading) {
    return <div className="profile-page"><p className="profile-state">Loading your profile...</p></div>;
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-avatar"><UserRound size={30} /></div>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your learning account and progress at a glance.</p>
        </div>
      </header>

      <div className="profile-layout">
        <section className="profile-summary" aria-label="Learning summary">
          <div className="profile-school-icon"><GraduationCap size={24} /></div>
          <span className="profile-eyebrow">CURRENT SCHOOL</span>
          <h2>{profile.school || 'School not added'}</h2>
          <div className="profile-metrics">
            <div><strong>{grade}</strong><span>Current grade</span></div>
            <div><strong>{averageMark === null ? '—' : `${averageMark}%`}</strong><span>Average mark</span></div>
            <div><strong>{completed}/{tasks.length}</strong><span>Tasks completed</span></div>
          </div>
        </section>

        <section className="profile-edit" aria-labelledby="profile-edit-title">
          <h2 id="profile-edit-title">Basic details</h2>
          {error && <p className="profile-message profile-error" role="alert">{error}</p>}
          {notice && <p className="profile-message profile-notice" role="status">{notice}</p>}
          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              <span>Full name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                maxLength={100}
              />
            </label>
            <label>
              <span>Email</span>
              <input value={profile.email} readOnly />
            </label>
            <label>
              <span>School or college</span>
              <input
                value={form.school}
                onChange={(event) => setForm((current) => ({ ...current, school: event.target.value }))}
                required
                maxLength={160}
              />
            </label>
            <button className="profile-save" type="submit" disabled={saving}>
              <Save size={17} /> {saving ? 'Saving...' : 'Save details'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}