import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Signup.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher'
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (signup(formData.name, formData.email, formData.password, formData.role)) {
      navigate('/login', {
        state: { message: 'Account created. Sign in with your new account.' }
      });
    } else {
      setError('Signup failed. Email may already be in use.');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-bg-grid"></div>
      <div className="signup-container">
        <div className="signup-header">
          <span className="signup-logo">⛏️</span>
          <h1 className="signup-title">Join BlockLearn AI</h1>
          <p className="signup-subtitle">Create your account</p>
        </div>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Prof. Steve"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="professor@blocklearn.edu"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-input form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Administrator</option>
              <option value="assistant">Teaching Assistant</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="signup-btn">
            ️ Create Account
          </button>
          <div className="signup-hint">
            Already have an account? <Link to="/login" className="login-link">Login here</Link>
          </div>
        </form>
        <div className="signup-features">
          <div className="feature">🤖 AI Insights</div>
          <div className="feature">📊 Analytics</div>
          <div className="feature"> Student Tracking</div>
        </div>
      </div>
    </div>
  );
}