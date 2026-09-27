import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Brain, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/students', icon: <Users size={20} />, label: 'Students' },
    { path: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { path: '/ai-insights', icon: <Brain size={20} />, label: 'AI Insights' },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside id="section-navigation" className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
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
              onClick={onClose}
            >
              <span className="link-icon">{link.icon}</span>
              <span className="link-label">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-avatar">👨‍🏫</span>
            <span className="user-name">{user?.name}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}