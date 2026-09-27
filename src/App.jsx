import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentChat from './pages/StudentChat.jsx';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';

// Simple Auth State (Since we removed the complex Context for simplicity)
function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    window.location.href = '/login';
  };

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

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
          <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<StudentChat />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;