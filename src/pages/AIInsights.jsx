import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, TrendingUp, Users, Brain, RefreshCw } from 'lucide-react';
import AIChat from '../components/AIChat';
import { apiUrl } from '../api.js';
import '../styles/AIInsights.css';

export default function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setError('');
    }
    
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(apiUrl(`insights/${studentId}`));
      
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
      setError("Failed to generate insights. The AI might be busy. Please try again.");
    } finally {
      // ✅ This guarantees the loading screen ALWAYS turns off
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [navigate]);

  const handleRefresh = () => fetchInsights(true);

  const getIcon = (type) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'pattern': return Brain;
      case 'recommendation': return Users;
      case 'critical': return AlertTriangle;
      default: return Sparkles;
    }
  };

  const typeColors = {
    critical: '#f87171', trend: '#4ade80', pattern: '#60a5fa',
    recommendation: '#c084fc', prediction: '#fbbf24',
  };

  if (loading) {
    return (
      <div className="ai-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-state">
          <div className="loading-brain">🧠</div>
          <p>Analyzing your personal data...</p>
          <div className="loading-bar">
            <div className="loading-bar-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 My AI Insights</h1>
          <p className="page-subtitle">Personalized analysis & recommendations just for you</p>
        </div>
        <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      <div className="ai-layout">
        <div className="insights-panel">
          <div className="section-header">
            <h2 className="section-title"><Sparkles size={18} /> Just For You</h2>
            <span className="insight-count">{insights.length} insights</span>
          </div>

          {error ? (
            <div style={{ padding: '20px', background: '#3d1a1a', border: '2px solid #ef4444', borderRadius: '4px', color: '#ef4444', fontFamily: 'MinecraftRegular, monospace' }}>
              ⚠️ {error}
            </div>
          ) : insights.length === 0 ? (
            <p style={{ color: '#a0a0b8', fontFamily: 'MinecraftRegular, monospace', padding: '20px' }}>
              No insights generated yet. Click refresh to ask the AI!
            </p>
          ) : (
            <div className="insights-list">
              {insights.map((insight, index) => {
                const Icon = getIcon(insight.type);
                const color = typeColors[insight.type] || '#60a5fa';
                
                return (
                  <div key={index} className="insight-card" style={{ borderLeftColor: color }}>
                    <div className="insight-header">
                      <div className="insight-icon" style={{ background: `${color}20`, color: color }}>
                        <Icon size={20} />
                      </div>
                      <div className="insight-meta">
                        <h4 className="insight-title">{insight.title}</h4>
                        <span className="insight-time">{insight.timestamp}</span>
                      </div>
                      <div className="confidence-badge" style={{ borderColor: color, color: color }}>
                        {insight.confidence}%
                      </div>
                    </div>
                    <p className="insight-description">{insight.description}</p>
                    <div className="insight-footer">
                      <button className="action-btn" style={{ borderColor: color, color: color }}>
                        ⚡ {insight.action}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="right-panel">
          <AIChat />
        </div>
      </div>
    </div>
  );
}
