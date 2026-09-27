import React from 'react'
import '../styles/StatCard.css'

export default function StatCard({ icon: Icon, label, value, change, color, trend }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-header">
        <div className={`stat-icon stat-icon-${color}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`stat-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trend === 'up' ? '▲' : '▼'} {change}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-bar">
        <div className={`stat-bar-fill stat-bar-${color}`} style={{ width: change }}></div>
      </div>
    </div>
  )
}