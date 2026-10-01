import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pickaxe, Lock, User, Sparkles } from 'lucide-react';
import '../styles/Signup.css';

export default function Signup({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          school: formData.school,
          password: formData.password // ✅ Now sending the password!
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // ✅ Save the session so the app knows who is logged in
      localStorage.setItem('currentStudentId', data.id);
      localStorage.setItem('currentStudentName', data.name);

      if (onLogin) {
        onLogin({ id: data.id, name: data.name, email: data.email, school: data.school, role: 'Student' });
      }
      
      navigate('/'); // Go to dashboard
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-bg-grid"></div>
      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-logo">
            <Pickaxe size={40} color="#4ade80" />
            <Sparkles size={24} color="#fbbf24" className="sparkle-icon" />
          </div>
          <h1 className="signup-title">Join EduCraft AI</h1>
          <p className="signup-subtitle">Create your student account</p>
        </div>
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label"><User size={16} /> Full Name</label>
            <input
              type="text"
              name="name"
              className="mc-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Steve Miner"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">📧 Email</label>
            <input
              type="email"
              name="email"
              className="mc-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@educraft.edu"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label"><User size={16} /> School or College</label>
            <input
              type="text"
              name="school"
              className="mc-input"
              value={formData.school}
              onChange={handleChange}
              placeholder="Your school or college"
              maxLength={160}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label"><Lock size={16} /> Password</label>
            <input
              type="password"
              name="password"
              className="mc-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label"><Lock size={16} /> Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="mc-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="mc-btn mc-btn-primary" disabled={loading}>
            {loading ? '⛏️ Mining your account...' : '⛏️ Create Account'}
          </button>

          <div className="login-hint">
            Already have an account? <Link to="/login" className="signup-link">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}