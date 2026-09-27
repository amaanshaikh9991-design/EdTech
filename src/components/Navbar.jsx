import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import '../styles/Navbar.css';

export default function Navbar({ onMenuClick, sidebarOpen }) {
  return (
    <header className="navbar">
      <button
        className="hamburger-btn"
        onClick={onMenuClick}
        aria-label="Toggle section navigation"
        aria-controls="section-navigation"
        aria-expanded={sidebarOpen}
      >
        <Menu size={24} />
      </button>
      <div className="navbar-search">
        <Search size={18} />
        <input type="text" placeholder="Search students, insights..." />
      </div>
      <div className="navbar-actions">
        <button className="notif-btn">
          <Bell size={20} />
          <span className="notif-badge">3</span>
        </button>
        <div className="navbar-date">
          📅 Sunday, Sep 27, 2026
        </div>
      </div>
    </header>
  );
}