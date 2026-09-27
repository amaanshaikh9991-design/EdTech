import React, { useState, useEffect } from 'react'
import { Send, Sparkles, AlertTriangle, TrendingUp, Users, Brain, RefreshCw } from 'lucide-react'
import AIChat from '../components/AIChat'
import '../styles/AIInsights.css'

const aiInsights = [
  {
    id: 1,
    type: 'critical',
    icon: AlertTriangle,
    title: 'High-Risk Students Detected',
    description: '5 students show critical disengagement patterns. Emma Wilson and Tom Garcia have not logged in for 5+ days.',
    action: 'Send re-engagement emails',
    confidence: 94,
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    type: 'trend',
    icon: TrendingUp,
    title: 'Engagement Improving',
    description: 'Overall class engagement increased by 12% this week. Discussion participation is the main driver.',
    action: 'Continue current strategies',
    confidence: 87,
    timestamp: '5 hours ago'
  },
  {
    id: 3,
    type: 'pattern',
    icon: Brain,
    title: 'Learning Pattern Identified',
    description: 'Students who complete video lectures within 24h of posting score 23% higher on quizzes.',
    action: 'Set up reminder notifications',
    confidence: 91,
    timestamp: '1 day ago'
  },
  {
    id: 4,
    type: 'recommendation',
    icon: Users,
    title: 'Peer Grouping Suggestion',
    description: 'Pairing Sarah Kim with Priya Patel could improve Sarah\'s engagement by an estimated 18%.',
    action: 'Create study group',
    confidence: 78,
    timestamp: '1 day ago'
  },
  {
    id: 5,
    type: 'prediction',
    icon: Sparkles,
    title: 'Retention Forecast',
    description: 'Based on current trends, predicted end-of-semester retention rate is 91%. Risk of 22 students dropping.',
    action: 'Review intervention plan',
    confidence: 83,
    timestamp: '2 days ago'
  },
]

const quickActions = [
  { label: ' Email At-Risk Students', color: '#f87171' },
  { label: '📊 Generate Report', color: '#60a5fa' },
  { label: '🎯 Create Intervention Plan', color: '#fbbf24' },
  { label: '👥 Suggest Study Groups', color: '#c084fc' },
  { label: '📱 Send Push Notifications', color: '#4ade80' },
  { label: '📋 Export Data', color: '#fb923c' },
]

export default function AIInsights() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  const typeColors = {
    critical: '#f87171',
    trend: '#4ade80',
    pattern: '#60a5fa',
    recommendation: '#c084fc',
    prediction: '#fbbf24',
  }

  return (
    <div className="ai-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 AI Insights</h1>
          <p className="page-subtitle">Intelligent analysis & recommendations</p>
        </div>
        <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      <div className="ai-layout">
        <div className="insights-panel">
          <div className="section-header">
            <h2 className="section-title">
              <Sparkles size={18} />
              AI-Generated Insights
            </h2>
            <span className="insight-count">{aiInsights.length} insights</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-brain">🧠</div>
              <p>Analyzing student data...</p>
              <div className="loading-bar">
                <div className="loading-bar-fill"></div>
              </div>
            </div>
          ) : (
            <div className="insights-list">
              {aiInsights.map((insight) => {
                const Icon = insight.icon
                return (
                  <div key={insight.id} className="insight-card" style={{ borderLeftColor: typeColors[insight.type] }}>
                    <div className="insight-header">
                      <div className="insight-icon" style={{ background: `${typeColors[insight.type]}20`, color: typeColors[insight.type] }}>
                        <Icon size={20} />
                      </div>
                      <div className="insight-meta">
                        <h4 className="insight-title">{insight.title}</h4>
                        <span className="insight-time">{insight.timestamp}</span>
                      </div>
                      <div className="confidence-badge" style={{ borderColor: typeColors[insight.type], color: typeColors[insight.type] }}>
                        {insight.confidence}%
                      </div>
                    </div>
                    <p className="insight-description">{insight.description}</p>
                    <div className="insight-footer">
                      <button className="action-btn" style={{ borderColor: typeColors[insight.type], color: typeColors[insight.type] }}>
                         {insight.action}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="quick-actions-card">
            <h3 className="section-title">⚡ Quick Actions</h3>
            <div className="actions-grid">
              {quickActions.map((action, i) => (
                <button key={i} className="action-chip" style={{ borderColor: `${action.color}40`, color: action.color }}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <AIChat />
        </div>
      </div>
    </div>
  )
}