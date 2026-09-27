import React from 'react';
import '../styles/ChartCard.css';

export default function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <span className="chart-badge">LIVE</span>
      </div>
      <div className="chart-body">{children}</div>
    </div>
  );
}