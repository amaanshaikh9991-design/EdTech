import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import '../styles/Navbar.css';

export default function Navbar({ onMenuClick, sidebarOpen = true, user }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/tasks?q=${encodeURIComponent(query)}` : '/tasks');
  };

  return (
    <header className="navbar" style={sidebarOpen ? undefined : { left: 0 }}>

      {/* Hamburger */}
      <button
        className="hamburger-btn"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Search */}
      <form className="navbar-search" onSubmit={handleSearch}>
        <Search size={18} />

        <input
          type="text"
          placeholder="Search tasks and subjects..."
          aria-label="Search tasks and subjects"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>

      {/* Right Side */}
      <div className="navbar-actions">

        {/* Notifications */}
        <button
          className="notif-btn"
          type="button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          aria-expanded={notificationsOpen}
          aria-controls="navbar-notifications"
          onClick={() => setNotificationsOpen((open) => !open)}
        >
          <Bell size={20} />

          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>

        {notificationsOpen && (
          <div
            id="navbar-notifications"
            role="status"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 24,
              width: 260,
              padding: 16,
              background: '#1a1a2e',
              border: '2px solid #2d2d44',
              borderRadius: 6,
              color: '#e0e0e0',
              fontFamily: 'MinecraftRegular, monospace',
              fontSize: 13,
              zIndex: 1,
            }}
          >
            <p style={{ margin: '0 0 12px' }}>
              {unreadCount ? `You have ${unreadCount} unread notifications.` : 'You are all caught up.'}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => setUnreadCount(0)}
                style={{
                  padding: 0,
                  background: 'transparent',
                  border: 0,
                  color: '#4ade80',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Mark all as read
              </button>
            )}
          </div>
        )}

        {/* User */}
        <div className="navbar-user">
          <span className="user-avatar-small">
            👨‍🎓
          </span>

          <span className="user-name-small">
            {user?.name || 'Student'}
          </span>
        </div>

      </div>

    </header>
  );
}