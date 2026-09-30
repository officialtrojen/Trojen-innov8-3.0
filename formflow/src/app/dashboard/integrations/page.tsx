'use client';

import React from 'react';
import { Webhook, Mail, Database, Search, MessageSquare, Briefcase } from 'lucide-react';

export default function IntegrationsPage() {
  const integrations = [
    { name: 'Google Sheets', desc: 'Send responses directly to a spreadsheet.', icon: Database, color: '#34A853', status: 'Connect' },
    { name: 'Slack', desc: 'Get notified in your channels.', icon: MessageSquare, color: '#E01E5A', status: 'Connect' },
    { name: 'Notion', desc: 'Create databases from submissions.', icon: Briefcase, color: '#F8FAFC', status: 'Connect' },
    { name: 'Mailchimp', desc: 'Sync emails to your newsletters.', icon: Mail, color: '#FFE01B', status: 'Pro' },
    { name: 'Webhooks', desc: 'Send payloads to custom endpoints.', icon: Webhook, color: '#8B5CF6', status: 'Connect' },
    { name: 'Salesforce', desc: 'Sync leads to your CRM.', icon: Search, color: '#00A1E0', status: 'Enterprise' },
  ];

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.02em' }}>Integrations</h1>
        <p style={{ color: '#94A3B8', fontSize: 16 }}>Connect FormFlow with your favorite tools and automate your workflow.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {integrations.map((app, i) => (
          <div key={i} style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'border-color 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: app.color }}>
                <app.icon size={24} />
              </div>
              <span style={{ 
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                background: app.status === 'Connect' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
                color: app.status === 'Connect' ? '#818CF8' : '#94A3B8'
              }}>
                {app.status}
              </span>
            </div>
            
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F8FAFC', marginBottom: 8 }}>{app.name}</h3>
            <p style={{ fontSize: 14, color: '#94A3B8', flex: 1, lineHeight: 1.5 }}>{app.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
