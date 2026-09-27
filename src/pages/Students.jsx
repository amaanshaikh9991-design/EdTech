import React, { useState } from 'react'
import { Search, Filter, MoreVertical, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import '../styles/Students.css'

const studentsData = [
  { id: 1, name: 'Alex Chen', avatar: 'AC', engagement: 92, status: 'excellent', trend: 'up', lastActive: '2 min ago', grade: 'A', assignments: 24, avgScore: 95 },
  { id: 2, name: 'Sarah Kim', avatar: 'SK', engagement: 78, status: 'good', trend: 'down', lastActive: '1 hr ago', grade: 'B+', assignments: 22, avgScore: 87 },
  { id: 3, name: 'Mike Ross', avatar: 'MR', engagement: 45, status: 'at-risk', trend: 'down', lastActive: '3 days ago', grade: 'C-', assignments: 15, avgScore: 62 },
  { id: 4, name: 'Emma Wilson', avatar: 'EW', engagement: 35, status: 'critical', trend: 'down', lastActive: '5 days ago', grade: 'D', assignments: 12, avgScore: 48 },
  { id: 5, name: 'James Lee', avatar: 'JL', engagement: 88, status: 'good', trend: 'up', lastActive: '30 min ago', grade: 'A-', assignments: 23, avgScore: 91 },
  { id: 6, name: 'Priya Patel', avatar: 'PP', engagement: 95, status: 'excellent', trend: 'up', lastActive: '5 min ago', grade: 'A+', assignments: 24, avgScore: 98 },
  { id: 7, name: 'David Brown', avatar: 'DB', engagement: 62, status: 'at-risk', trend: 'minus', lastActive: '1 day ago', grade: 'B-', assignments: 19, avgScore: 74 },
  { id: 8, name: 'Lisa Wang', avatar: 'LW', engagement: 82, status: 'good', trend: 'up', lastActive: '15 min ago', grade: 'A-', assignments: 23, avgScore: 89 },
  { id: 9, name: 'Tom Garcia', avatar: 'TG', engagement: 28, status: 'critical', trend: 'down', lastActive: '7 days ago', grade: 'F', assignments: 8, avgScore: 35 },
  { id: 10, name: 'Nina Johnson', avatar: 'NJ', engagement: 71, status: 'good', trend: 'up', lastActive: '2 hrs ago', grade: 'B', assignments: 21, avgScore: 82 },
]

const statusConfig = {
  excellent: { label: 'Excellent', color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
  good: { label: 'Good', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  'at-risk': { label: 'At Risk', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  critical: { label: 'Critical', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  minus: Minus,
}

export default function Students() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filtered = studentsData
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => filterStatus === 'all' || s.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'engagement') return b.engagement - a.engagement
      if (sortBy === 'score') return b.avgScore - a.avgScore
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="students-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Students</h1>
          <p className="page-subtitle">Track and manage all your learners</p>
        </div>
        <div className="header-stats">
          <div className="mini-stat">
            <span className="mini-stat-value">248</span>
            <span className="mini-stat-label">Total</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value" style={{ color: '#4ade80' }}>162</span>
            <span className="mini-stat-label">Engaged</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value" style={{ color: '#f87171' }}>32</span>
            <span className="mini-stat-label">At Risk</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="at-risk">At Risk</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="filter-group">
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="engagement">Engagement</option>
            <option value="score">Score</option>
          </select>
        </div>
      </div>

      <div className="students-table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Engagement</th>
              <th>Grade</th>
              <th>Avg Score</th>
              <th>Assignments</th>
              <th>Last Active</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => {
              const config = statusConfig[student.status]
              const TrendIcon = trendIcons[student.trend]
              return (
                <tr key={student.id} className="student-row">
                  <td>
                    <div className="student-info">
                      <div className="student-avatar">{student.avatar}</div>
                      <span className="student-name">{student.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ color: config.color, background: config.bg }}>
                      {config.label}
                    </span>
                  </td>
                  <td>
                    <div className="engagement-bar-container">
                      <div className="engagement-bar-fill" style={{
                        width: `${student.engagement}%`,
                        background: student.engagement > 75 ? '#4ade80' : student.engagement > 50 ? '#fbbf24' : '#f87171'
                      }}></div>
                      <span className="engagement-value">{student.engagement}%</span>
                    </div>
                  </td>
                  <td className="grade-cell">{student.grade}</td>
                  <td>{student.avgScore}%</td>
                  <td>{student.assignments}/24</td>
                  <td className="last-active">{student.lastActive}</td>
                  <td>
                    <TrendIcon size={18} color={student.trend === 'up' ? '#4ade80' : student.trend === 'down' ? '#f87171' : '#94a3b8'} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <span style={{ fontSize: 48 }}>🔍</span>
          <p>No students found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
