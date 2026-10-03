import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, Users, Brain, RefreshCw } from 'lucide-react';
import AIChat from '../components/AIChat';
import { apiFetch } from '../api.js';
import { getCurrentStudentId } from '../session.js';
import '../styles/AIInsights.css';

export default function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const fetchInsights = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setError('');
    }
    
    const studentId = getCurrentStudentId();
    if (!studentId) {
      setError('Your session is missing or expired. Sign in again to view your insights.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await apiFetch(`insights/${studentId}`);
      
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      
      const data = await res.json();
      setInsights(data.insights || []);
      setSummary(data.summary || '');
      setMetrics(data.metrics || null);
      setStudent(data.student || null);
      setMarks(data.marks || []);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
      setError("Failed to generate insights. The AI might be busy. Please try again.");
    } finally {
      // ✅ This guarantees the loading screen ALWAYS turns off
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => fetchInsights(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [fetchInsights]);

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
          {student && (
            <div className="insight-student">
              {student.avatar ? <img src={student.avatar} alt="" /> : <span aria-hidden="true">🎓</span>}
              <strong>{student.name}</strong>
            </div>
          )}
        </div>
        <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      <div className="ai-layout">
        <div className="insights-panel">
          {metrics && (
            <section className="learning-summary" aria-label="Your learning summary">
              <h2>Progress summary</h2>
              <p>{summary || 'Keep adding tasks and marks to build your personal progress summary.'}</p>
              <div className="learning-metrics">
                <div><strong>{metrics.completedTasks}/{metrics.totalTasks}</strong><span>Tasks completed</span></div>
                <div><strong>{metrics.markCount}</strong><span>Marks recorded</span></div>
              </div>
              <div className="insight-mark-list">
                <h3>Recent subject marks</h3>
                {marks.length ? marks.slice(0, 5).map((mark) => (
                  <div className="insight-mark-row" key={mark.id}>
                    <span><strong>{mark.subject}</strong><small>{mark.title || 'Assessment'}</small></span>
                    <strong>{mark.score} / {mark.maxScore}</strong>
                  </div>
                )) : <p>No marks recorded yet. Add subject results from My Marks to personalize your analysis.</p>}
              </div>
            </section>
          )}
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
