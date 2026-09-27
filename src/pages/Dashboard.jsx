import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' // ✅ Added this import
import { TrendingUp, AlertTriangle, BookOpen, Bot, Award } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import StatCard from '../components/StatCard'
import '../styles/Dashboard.css'

// Student-focused data
const myPerformanceData = [
  { subject: 'Math', avg: 78, target: 85 },
  { subject: 'Science', avg: 82, target: 85 },
  { subject: 'English', avg: 75, target: 80 },
  { subject: 'History', avg: 88, target: 85 },
  { subject: 'Art', avg: 91, target: 85 },
]

const myAssignmentStatus = [
  { name: 'Completed', value: 65, color: '#4ade80' },
  { name: 'In Progress', value: 20, color: '#fbbf24' },
  { name: 'Missing', value: 10, color: '#f87171' },
  { name: 'Extra Credit', value: 5, color: '#60a5fa' },
]

const myWeeklyActivity = [
  { week: 'W1', submissions: 4, interactions: 12 },
  { week: 'W2', submissions: 5, interactions: 15 },
  { week: 'W3', submissions: 3, interactions: 8 },
  { week: 'W4', submissions: 6, interactions: 18 },
  { week: 'W5', submissions: 5, interactions: 14 },
  { week: 'W6', submissions: 7, interactions: 20 },
]

const myRecentAlerts = [
  { id: 1, type: 'info', message: 'Great job on the Math quiz! Score: 92%', time: '2h ago' },
  { id: 2, type: 'warning', message: 'Science assignment due tomorrow.', time: '4h ago' },
  { id: 3, type: 'critical', message: 'You missed 2 discussion posts this week.', time: '1d ago' },
  { id: 4, type: 'info', message: 'AI Tutor noticed your engagement is up 25%! 🟩', time: '2d ago' },
]

export default function Dashboard() {
  const navigate = useNavigate() // ✅ Added this
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Fetch real student data from your backend
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/students/1')
        const data = await res.json()
        setStudent(data)
      } catch (error) {
        console.error("Failed to fetch student data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudentData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 className="page-title">⛏️ Loading your world...</h2>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* ✅ Clean, single page header with the AI button integrated */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🎒 My Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {student?.name || 'Student'}! Ready to level up your learning?
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="live-indicator">
            <span className="live-dot"></span>
            LIVE
          </span>
          <button className="ai-btn" onClick={() => navigate('/chat')}>
            <Bot size={18} style={{ marginRight: '8px' }} />
            Talk to AI Tutor
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={TrendingUp}
          label="My Engagement"
          value={`${student?.engagement || 0}%`}
          change={student?.trend === 'up' ? '+5%' : '-2%'}
          color={student?.engagement > 80 ? 'green' : 'orange'}
          trend={student?.trend}
        />
        <StatCard
          icon={Award}
          label="Current Grade"
          value={student?.grade || 'A'}
          change="Top 15%"
          color="blue"
          trend="up"
        />
        <StatCard
          icon={AlertTriangle}
          label="Action Needed"
          value="2"
          change="Tasks"
          color="orange"
          trend="stable"
        />
        <StatCard
          icon={BookOpen}
          label="Completion Rate"
          value="82%"
          change="+4%"
          color="green"
          trend="up"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-wide">
          <h3 className="chart-title">📈 My Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={myWeeklyActivity}>
              <defs>
                <linearGradient id="submissionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
              <XAxis dataKey="week" stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 12 }} />
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
              <Area type="monotone" dataKey="submissions" stroke="#4ade80" fill="url(#submissionsGrad)" strokeWidth={2} name="Assignments" />
              <Area type="monotone" dataKey="interactions" stroke="#60a5fa" fill="none" strokeWidth={2} name="Interactions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">📋 Assignment Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={myAssignmentStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={{ stroke: '#64748b' }}
              >
                {myAssignmentStatus.map((entry, index) => (
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
          <h3 className="chart-title">📊 My Subject Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={myPerformanceData} barGap={8}>
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
              <Bar dataKey="avg" fill="#4ade80" radius={[2, 2, 0, 0]} name="My Average" />
              <Bar dataKey="target" fill="rgba(96,165,250,0.5)" radius={[2, 2, 0, 0]} name="Class Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">🔔 My Recent Updates</h3>
          <div className="alerts-list">
            {myRecentAlerts.map((alert) => (
              <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                <div className={`alert-dot alert-dot-${alert.type}`}></div>
                <div className="alert-content">
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