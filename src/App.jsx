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
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';

export default function App() {
  // ✅ Check localStorage immediately on load to prevent logout on refresh
  const [user, setUser] = useState(() => {
    const savedId = localStorage.getItem('currentStudentId');
    const savedName = localStorage.getItem('currentStudentName');
    return savedId ? { id: savedId, name: savedName, role: 'Student' } : null;
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

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentStudentId');
    localStorage.removeItem('currentStudentName');
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