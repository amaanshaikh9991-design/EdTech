import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, AlertTriangle, BookOpen, Activity } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import StatCard from '../components/StatCard'
import '../styles/Dashboard.css'

const engagementData = [
  { day: 'Mon', engaged: 85, disengaged: 15 },
  { day: 'Tue', engaged: 78, disengaged: 22 },
  { day: 'Wed', engaged: 92, disengaged: 8 },
  { day: 'Thu', engaged: 70, disengaged: 30 },
  { day: 'Fri', engaged: 88, disengaged: 12 },
  { day: 'Sat', engaged: 65, disengaged: 35 },
  { day: 'Sun', engaged: 72, disengaged: 28 },
]

const performanceData = [
  { subject: 'Math', avg: 78, target: 85 },
  { subject: 'Science', avg: 82, target: 85 },
  { subject: 'English', avg: 75, target: 80 },
  { subject: 'History', avg: 88, target: 85 },
  { subject: 'Art', avg: 91, target: 85 },
]

const riskDistribution = [
  { name: 'On Track', value: 65, color: '#4ade80' },
  { name: 'At Risk', value: 20, color: '#fbbf24' },
  { name: 'Critical', value: 10, color: '#f87171' },
  { name: 'Excellent', value: 5, color: '#60a5fa' },
]

const weeklyActivity = [
  { week: 'W1', submissions: 120, interactions: 340 },
  { week: 'W2', submissions: 135, interactions: 380 },
  { week: 'W3', submissions: 110, interactions: 290 },
  { week: 'W4', submissions: 145, interactions: 420 },
  { week: 'W5', submissions: 160, interactions: 450 },
  { week: 'W6', submissions: 155, interactions: 410 },
]

const recentAlerts = [
  { id: 1, student: 'Alex Chen', type: 'critical', message: 'No login for 5 days', time: '2h ago' },
  { id: 2, student: 'Sarah Kim', type: 'warning', message: 'Assignment score dropped 30%', time: '4h ago' },
  { id: 3, student: 'Mike Ross', type: 'warning', message: 'Low participation in discussions', time: '6h ago' },
  { id: 4, student: 'Emma Wilson', type: 'critical', message: 'Failed 3 consecutive quizzes', time: '8h ago' },
  { id: 5, student: 'James Lee', type: 'info', message: 'Engagement improved by 25%', time: '12h ago' },
]

export default function Dashboard() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100)
  }, [])

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⛏️ Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your class overview.</p>
        </div>
        <div className="header-actions">
          <span className="live-indicator">
            <span className="live-dot"></span>
            LIVE
          </span>
          <span className="header-date">Sunday, Sep 27, 2026</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Total Students"
          value="248"
          change="85%"
          color="green"
          trend="up"
        />
        <StatCard
          icon={TrendingUp}
          label="Engagement Rate"
          value="78.5%"
          change="72%"
          color="blue"
          trend="up"
        />
        <StatCard
          icon={AlertTriangle}
          label="At Risk Students"
          value="32"
          change="45%"
          color="orange"
          trend="down"
        />
        <StatCard
          icon={BookOpen}
          label="Avg. Completion"
          value="82%"
          change="68%"
          color="purple"
          trend="up"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-wide">
          <h3 className="chart-title">📈 Weekly Engagement Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="engagedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="disengagedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
              <XAxis dataKey="day" stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 12 }} />
              <YAxis stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '2px solid #4ade80',
                  borderRadius: '2px',
                  fontFamily: 'MinecraftRegular, monospace',
                  color: '#f1f5f9'
                }}
              />
              <Area type="monotone" dataKey="engaged" stroke="#4ade80" fill="url(#engagedGrad)" strokeWidth={2} name="Engaged %" />
              <Area type="monotone" dataKey="disengaged" stroke="#f87171" fill="url(#disengagedGrad)" strokeWidth={2} name="Disengaged %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title"> Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={{ stroke: '#64748b' }}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '2px solid #4ade80',
                  borderRadius: '2px',
                  fontFamily: 'MinecraftRegular, monospace',
                  color: '#f1f5f9'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="chart-card">
          <h3 className="chart-title"> Subject Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
              <XAxis dataKey="subject" stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 11 }} />
              <YAxis stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '2px solid #4ade80',
                  borderRadius: '2px',
                  fontFamily: 'MinecraftRegular, monospace',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="avg" fill="#4ade80" radius={[2, 2, 0, 0]} name="Average" />
              <Bar dataKey="target" fill="rgba(96,165,250,0.5)" radius={[2, 2, 0, 0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">🔔 Recent Alerts</h3>
          <div className="alerts-list">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                <div className="alert-dot"></div>
                <div className="alert-content">
                  <span className="alert-student">{alert.student}</span>
                  <span className="alert-message">{alert.message}</span>
                </div>
                <span className="alert-time">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}