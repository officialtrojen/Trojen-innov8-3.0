import React from 'react';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.02em' }}>Advanced Analytics</h1>
        <p style={{ color: '#94A3B8', fontSize: 16 }}>Deep dive into your submission data and audience behavior.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
        {['Total Views', 'Completion Rate', 'Avg. Time', 'Drop-off Rate'].map((title, i) => (
          <div key={i} style={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <span style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 8 }}>{title}</span>
            <div style={{ width: '40%', height: 32, background: 'rgba(148, 163, 184, 0.1)', borderRadius: 4 }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16
        }}>
          <BarChart3 size={48} color="rgba(148, 163, 184, 0.3)" />
          <p style={{ color: '#94A3B8' }}>Not enough data to display audience trends.</p>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16
        }}>
          <PieChart size={48} color="rgba(148, 163, 184, 0.3)" />
          <p style={{ color: '#94A3B8' }}>Device Breakdown Unavailable</p>
        </div>
      </div>
    </div>
  );
}
