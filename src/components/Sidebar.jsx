import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, BarChart3, Brain, UserRound, LogOut, X } from 'lucide-react';
import '../styles/Sidebar.css';

export default function Sidebar({ isOpen, onClose, user, onLogout }) {
  const location = useLocation();

  const links = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/tasks', icon: <ListTodo size={20} />, label: 'My Tasks' },
    { path: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { path: '/ai-insights', icon: <Brain size={20} />, label: 'AI Insights' },
    { path: '/profile', icon: <UserRound size={20} />, label: 'My Profile' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">⛏️</span>
            <span className="logo-text">BlockLearn AI</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 768) onClose();
              }}
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-label">{link.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-avatar">
              {user?.avatar ? <img src={user.avatar} alt="" /> : '👨‍🎓'}
            </span>
            <span className="user-name">{user?.name || localStorage.getItem('currentStudentName')}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}