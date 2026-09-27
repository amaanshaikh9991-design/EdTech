import React from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Area
} from 'recharts'
import '../styles/Analytics.css'

const monthlyRetention = [
  { month: 'Jan', retention: 95, engagement: 82 },
  { month: 'Feb', retention: 92, engagement: 78 },
  { month: 'Mar', retention: 88, engagement: 75 },
  { month: 'Apr', retention: 91, engagement: 80 },
  { month: 'May', retention: 87, engagement: 72 },
  { month: 'Jun', retention: 83, engagement: 68 },
  { month: 'Jul', retention: 89, engagement: 76 },
  { month: 'Aug', retention: 93, engagement: 84 },
  { month: 'Sep', retention: 96, engagement: 88 },
]

const skillRadar = [
  { skill: 'Problem Solving', A: 85, B: 70 },
  { skill: 'Collaboration', A: 78, B: 82 },
  { skill: 'Communication', A: 90, B: 75 },
  { skill: 'Critical Thinking', A: 72, B: 68 },
  { skill: 'Creativity', A: 88, B: 90 },
  { skill: 'Time Mgmt', A: 65, B: 72 },
]

const assignmentCompletion = [
  { class: 'Math 101', completed: 92, late: 5, missing: 3 },
  { class: 'Science 201', completed: 85, late: 10, missing: 5 },
  { class: 'English 102', completed: 78, late: 12, missing: 10 },
  { class: 'History 301', completed: 95, late: 3, missing: 2 },
  { class: 'Art 101', completed: 98, late: 1, missing: 1 },
]

const timeDistribution = [
  { name: 'Video Lectures', value: 35, color: '#4ade80' },
  { name: 'Assignments', value: 25, color: '#60a5fa' },
  { name: 'Discussions', value: 20, color: '#fbbf24' },
  { name: 'Quizzes', value: 12, color: '#c084fc' },
  { name: 'Reading', value: 8, color: '#fb923c' },
]

const weeklyTrend = [
  { week: 'W1', active: 180, new: 12, dropped: 3 },
  { week: 'W2', active: 195, new: 8, dropped: 5 },
  { week: 'W3', active: 188, new: 15, dropped: 2 },
  { week: 'W4', active: 210, new: 10, dropped: 4 },
  { week: 'W5', active: 225, new: 18, dropped: 1 },
  { week: 'W6', active: 240, new: 14, dropped: 3 },
  { week: 'W7', active: 238, new: 6, dropped: 6 },
  { week: 'W8', active: 248, new: 12, dropped: 2 },
]

export default function Analytics() {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Analytics</h1>
          <p className="page-subtitle">Deep dive into performance metrics</p>
        </div>
        <div className="period-selector">
          <button className="period-btn active">This Semester</button>
          <button className="period-btn">Last Semester</button>
          <button className="period-btn">All Time</button>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card chart-full">
          <h3 className="chart-title">📈 Retention & Engagement Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyRetention}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 12 }} />
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
              <Area type="monotone" dataKey="retention" fill="rgba(74,222,128,0.1)" stroke="#4ade80" strokeWidth={2} name="Retention %" />
              <Line type="monotone" dataKey="engagement" stroke="#60a5fa" strokeWidth={3} dot={{ fill: '#60a5fa', r: 4 }} name="Engagement %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">🎯 Skill Assessment Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillRadar}>
              <PolarGrid stroke="rgba(74,222,128,0.2)" />
              <PolarAngleAxis dataKey="skill" stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 10 }} />
              <PolarRadiusAxis stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 10 }} />
              <Radar name="Class A" dataKey="A" stroke="#4ade80" fill="#4ade80" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Class B" dataKey="B" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '2px solid #4ade80',
                  borderRadius: '2px',
                  fontFamily: 'MinecraftRegular, monospace',
                  color: '#f1f5f9'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title"> Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={{ stroke: '#64748b' }}
              >
                {timeDistribution.map((entry, index) => (
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

        <div className="chart-card chart-full">
          <h3 className="chart-title">📋 Assignment Completion by Class</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={assignmentCompletion} barGap={4} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
              <XAxis dataKey="class" stroke="#64748b" style={{ fontFamily: 'MinecraftRegular, monospace', fontSize: 11 }} />
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
              <Bar dataKey="completed" stackId="a" fill="#4ade80" radius={[0, 0, 0, 0]} name="Completed %" />
              <Bar dataKey="late" stackId="a" fill="#fbbf24" name="Late %" />
              <Bar dataKey="missing" stackId="a" fill="#f87171" radius={[2, 2, 0, 0]} name="Missing %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-full">
          <h3 className="chart-title">👥 Active Students Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyTrend}>
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
              <Line type="monotone" dataKey="active" stroke="#4ade80" strokeWidth={3} dot={{ fill: '#4ade80', r: 5 }} name="Active" />
              <Line type="monotone" dataKey="new" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} name="New" />
              <Line type="monotone" dataKey="dropped" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 4 }} name="Dropped" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}