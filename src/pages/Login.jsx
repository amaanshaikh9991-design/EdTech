import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pickaxe, Lock, User, Sparkles } from 'lucide-react';
import { apiUrl } from '../api.js';
import '../styles/Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // ✅ Save the session!
      localStorage.setItem('currentStudentId', data.id);
      localStorage.setItem('currentStudentName', data.name);

      if (onLogin) {
        onLogin(data);
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-grid"></div>
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <Pickaxe size={40} color="#4ade80" />
            <Sparkles size={24} color="#fbbf24" className="sparkle-icon" />
          </div>
          <h1 className="login-title">EduCraft AI</h1>
          <p className="login-subtitle">Student Engagement Platform</p>
          <div className="login-divider"></div>
          <p className="login-tagline">⛏️ Mine knowledge. Build futures. ⛏️</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">
              <User size={16} />
              Email
            </label>
            <input
              type="email"
              className="mc-input"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              className="mc-input"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="mc-btn mc-btn-primary" disabled={loading}>
            {loading ? '⛏️ Entering World...' : '⛏️ Enter World'}
          </button>

          <div className="login-hint">
            Don't have an account?{' '}
            <Link to="/signup" className="signup-link">Sign up here</Link>
          </div>

          <div className="login-footer">
            <span>Sign in with your registered email and password</span>
          </div>
        </form>

        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <span>AI-Powered Insights</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Real-time Analytics</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Engagement Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}