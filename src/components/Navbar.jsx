import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import '../styles/Navbar.css';

export default function Navbar({ onMenuClick, sidebarOpen = true, user }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

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

        {/* User */}
        <div className="navbar-user">
          <span className="user-avatar-small">
            {user?.avatar ? <img src={user.avatar} alt="" /> : '👨‍🎓'}
          </span>

          <span className="user-name-small">
            {user?.name || 'Student'}
          </span>
        </div>

      </div>

    </header>
  );
}