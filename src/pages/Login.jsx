import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Pickaxe, Lock, User, Sparkles } from 'lucide-react'
import '../styles/Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (login(email, password)) {
      navigate('/')
      return
    }

    setError('Email or password is incorrect')
  }

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

          {location.state?.message && (
            <div className="login-success" role="status">{location.state.message}</div>
          )}
          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="mc-btn mc-btn-primary">
            ⛏️ Enter World
          </button>

          {/* ✅ Signup link goes HERE, inside the form */}
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
            <span className="feature-icon"></span>
            <span>Engagement Tracking</span>
          </div>
        </div>
      </div>
    </div>
  )
}