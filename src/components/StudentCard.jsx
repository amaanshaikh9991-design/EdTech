import React from 'react';
import '../styles/StudentCard.css';

export default function StudentCard({ student }) {
  const statusColors = {
    active: '#4ade80',
    'at-risk': '#f97316',
    disengaged: '#ef4444',
    watch: '#fbbf24',
  };

  return (
    <div className="student-card">
      <div className="student-header">
        <span className="student-avatar">{student.avatar}</span>
        <div className="student-info">
          <div className="student-name">{student.name}</div>
          <div className="student-grade">Grade: {student.grade}</div>
        </div>
        <span className="student-status" style={{ background: statusColors[student.status] }}>
          {student.status}
        </span>
      </div>
      <div className="student-metrics">
        <div className="metric">
          <span className="metric-label">Engagement</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${student.engagement}%` }}></div>
          </div>
          <span className="metric-value">{student.engagement}%</span>
        </div>
        <div className="metric-row">
          <span className="last-active"> {student.lastActive}</span>
          <span className={`trend trend-${student.trend}`}>
            {student.trend === 'up' ? '' : student.trend === 'down' ? '📉' : '➡️'}
          </span>
        </div>
      </div>
    </div>
  );
}