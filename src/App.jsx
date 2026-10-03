import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Profile from './pages/Profile.jsx';
import Analytics from './pages/Analytics.jsx';
import AIInsights from './pages/AIInsights.jsx';
import StudentChat from './pages/StudentChat.jsx';
import Marks from './pages/Marks.jsx';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import { apiFetch } from './api.js';
import { clearStudentSession, getCurrentStudentId, getStudentSession } from './session.js';

export default function App() {
  // ✅ Check localStorage immediately on load to prevent logout on refresh
  const [user, setUser] = useState(() => {
    const savedSession = getStudentSession();
    return savedSession ? { ...savedSession, role: 'Student' } : null;
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches
  );

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    const syncSidebar = () => setSidebarOpen(desktopQuery.matches);

    desktopQuery.addEventListener('change', syncSidebar);
    return () => desktopQuery.removeEventListener('change', syncSidebar);
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    let active = true;

    const refreshStudent = async () => {
      try {
        const response = await apiFetch(`students/${user.id}`);
        const student = response.ok ? await response.json() : null;
        if (active && student) setUser((current) => ({ ...current, ...student }));
      } catch {
        // Keep the current session data visible when the API is temporarily unavailable.
      }
    };

    refreshStudent();
    const refreshInterval = window.setInterval(refreshStudent, 60_000);
    window.addEventListener('student-data-changed', refreshStudent);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener('student-data-changed', refreshStudent);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const sentKey = `task-reminders-sent:${user.id}`;
    let sent = new Set();
    try {
      sent = new Set(JSON.parse(localStorage.getItem(sentKey) || '[]'));
    } catch {
      localStorage.removeItem(sentKey);
    }

    const timeouts = [];
    const incompleteTasks = (user.tasks || []).filter((task) => !task.isComplete && task.dueAt);
    for (const task of incompleteTasks) {
      const dueAt = new Date(task.dueAt).getTime();
      const taskKey = String(task.id);
      if (!Number.isFinite(dueAt) || dueAt <= Date.now() || sent.has(taskKey)) continue;

      const fireReminder = () => {
        const remaining = dueAt - Date.now();
        if (remaining > 0) {
          timeouts.push(window.setTimeout(fireReminder, Math.min(remaining, 2_147_000_000)));
          return;
        }
        if (getCurrentStudentId() !== String(user.id)) return;

        let currentSent = [];
        try {
          currentSent = JSON.parse(localStorage.getItem(sentKey) || '[]');
        } catch {
          currentSent = [];
        }
        if (currentSent.includes(taskKey)) return;
        localStorage.setItem(sentKey, JSON.stringify([...currentSent, taskKey]));

        const message = `${task.title}${task.subject ? ` · ${task.subject}` : ''}`;
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Task reminder', { body: `It's time to work on ${message}.` });
        } else {
          window.alert(`Task reminder\n\nIt's time to work on ${message}.`);
        }
      };

      timeouts.push(window.setTimeout(fireReminder, Math.min(dueAt - Date.now(), 2_147_000_000)));
    }

    return () => timeouts.forEach((timeout) => window.clearTimeout(timeout));
  }, [user?.id, user?.tasks]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    clearStudentSession();
    window.location.href = '/login';
  };

  // If not logged in, show login/signup routes
  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // If logged in, show app with sidebar
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          user={user} 
          onLogout={handleLogout} 
        />
        <div
          className={`app-content ${sidebarOpen ? 'menu-open' : ''}`}
          style={{ marginLeft: sidebarOpen && window.innerWidth > 768 ? 260 : 0 }}
        >
          <Navbar
            onMenuClick={() => setSidebarOpen((open) => !open)}
            sidebarOpen={sidebarOpen}
            user={user}
          />
          <main style={{ flex: 1, padding: '104px 24px 24px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/marks" element={<Marks />} />
              <Route path="/profile" element={<Profile onProfileUpdated={(updated) => setUser((current) => ({ ...current, ...updated }))} />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/chat" element={<StudentChat />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}