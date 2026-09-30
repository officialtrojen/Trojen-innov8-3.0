'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { DBForm, DBResponse } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  FileText,
  Users,
  Clock,
  Globe,
  Share2,
  ExternalLink,
  Edit2,
  Smartphone,
  Monitor,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const PIE_COLORS = ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F472B6'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [forms, setForms] = useState<DBForm[]>([]);
  const [responses, setResponses] = useState<DBResponse[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      let ownerId = user?.id;
      if (!ownerId) {
        const { data: authData } = await supabase.auth.getUser();
        ownerId = authData?.user?.id;
      }
      if (!ownerId && typeof window !== 'undefined') {
        ownerId = localStorage.getItem('formflow_guest_id') || undefined;
      }

      if (!ownerId) {
        setLoading(false);
        return;
      }

      // 1. Fetch user's forms
      const { data: formsData } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      const userForms = (formsData || []) as DBForm[];
      setForms(userForms);

      // 2. Fetch all responses belonging to these forms
      const formIds = userForms.map((f) => f.id);
      if (formIds.length > 0) {
        const { data: respData } = await supabase
          .from('responses')
          .select('*')
          .in('form_id', formIds)
          .order('submitted_at', { ascending: true });

        setResponses((respData || []) as DBResponse[]);
      } else {
        setResponses([]);
      }

      setLoading(false);
    }

    loadData();

    // Subscribe to realtime updates for live analytics stream
    const channel = supabase
      .channel('analytics-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'responses' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forms' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // Filter responses based on selected form dropdown
  const filteredResponses = useMemo(() => {
    if (selectedFormId === 'all') return responses;
    return responses.filter((r) => r.form_id === selectedFormId);
  }, [responses, selectedFormId]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalForms = forms.length;
    const publishedForms = forms.filter((f) => f.status === 'published').length;
    const totalSubmissions = filteredResponses.length;
    const avgResponsesPerForm =
      totalForms > 0 ? (totalSubmissions / Math.max(totalForms, 1)).toFixed(1) : '0';

    // Activity trend group by date
    const trendMap: Record<string, number> = {};
    const now = new Date();

    // Default last 7 days window
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[key] = 0;
    }

    filteredResponses.forEach((r) => {
      const d = new Date(r.submitted_at);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[key] = (trendMap[key] || 0) + 1;
    });

    const trendData = Object.entries(trendMap).map(([date, count]) => ({ date, count }));

    // Device breakdown
    let desktop = 0;
    let mobile = 0;
    filteredResponses.forEach((r) => {
      const dev = (r.metadata as any)?.device || '';
      if (dev.toLowerCase().includes('mobile') || dev.toLowerCase().includes('phone')) {
        mobile++;
      } else {
        desktop++;
      }
    });

    const deviceData = [
      { name: 'Desktop / Laptop', value: totalSubmissions > 0 ? desktop : 1 },
      { name: 'Mobile / Tablet', value: totalSubmissions > 0 ? mobile : 0 },
    ];

    return {
      totalForms,
      publishedForms,
      totalSubmissions,
      avgResponsesPerForm,
      trendData,
      deviceData,
    };
  }, [forms, filteredResponses]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65vh', gap: 12 }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <span style={{ fontSize: 14, color: '#94A3B8' }}>Loading Live Analytics...</span>
      </div>
    );
  }

  const activeFormTitle =
    selectedFormId === 'all'
      ? 'All Forms'
      : forms.find((f) => f.id === selectedFormId)?.title || 'Selected Form';

  return (
    <div style={{ paddingBottom: 60, maxWidth: 1240, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em', margin: 0 }}>
              Advanced Analytics
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(52, 211, 153, 0.12)',
                color: '#34D399',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                border: '1px solid rgba(52, 211, 153, 0.3)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399' }} />
              Live Sync
            </span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>
            Real-time audience tracking, submission rates, and performance across your workspace.
          </p>
        </div>

        {/* Form Filter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              style={{
                appearance: 'none',
                background: '#0B0F19',
                color: '#F8FAFC',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 10,
                padding: '9px 36px 9px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">📊 All Forms Combined ({forms.length})</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              color="#94A3B8"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>

          <Link href="/builder" className="btn btn-primary" style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13 }}>
            <Sparkles size={15} /> Create Form
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          {
            label: 'Total Submissions',
            value: metrics.totalSubmissions,
            icon: Users,
            color: '#38BDF8',
            bg: 'rgba(56, 189, 248, 0.1)',
            border: 'rgba(56, 189, 248, 0.25)',
          },
          {
            label: 'Active Published Forms',
            value: metrics.publishedForms,
            icon: Globe,
            color: '#34D399',
            bg: 'rgba(52, 211, 153, 0.1)',
            border: 'rgba(52, 211, 153, 0.25)',
          },
          {
            label: 'Average Submissions / Form',
            value: metrics.avgResponsesPerForm,
            icon: TrendingUp,
            color: '#818CF8',
            bg: 'rgba(129, 140, 248, 0.1)',
            border: 'rgba(129, 140, 248, 0.25)',
          },
          {
            label: 'Total Forms in Workspace',
            value: metrics.totalForms,
            icon: FileText,
            color: '#FBBF24',
            bg: 'rgba(251, 191, 36, 0.1)',
            border: 'rgba(251, 191, 36, 0.25)',
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: '#0B0F19',
              border: `1px solid ${card.border}`,
              borderRadius: 16,
              padding: '22px 24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{card.label}</span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                }}
              >
                <card.icon size={19} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              {card.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }} className="analytics-charts-grid">
        {/* Submission Trends Line / Area Chart */}
        <div
          style={{
            background: '#0B0F19',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 18,
            padding: '24px 28px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px' }}>
                Submission Activity (Last 7 Days)
              </h3>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>Filtered by: {activeFormTitle}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#38BDF8', fontWeight: 600 }}>
              <Activity size={14} /> Live Timeline
            </div>
          </div>

          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.trendData}>
                <defs>
                  <linearGradient id="submissionGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 10,
                    color: '#F8FAFC',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Responses"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#submissionGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown Pie Chart */}
        <div
          style={{
            background: '#0B0F19',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 18,
            padding: '24px 28px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px' }}>
              Device Breakdown
            </h3>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>User engagement by platform</span>
          </div>

          <div style={{ flex: 1, height: 180, width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.deviceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 10,
                    color: '#F8FAFC',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
              <Monitor size={14} color="#38BDF8" /> Desktop
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
              <Smartphone size={14} color="#818CF8" /> Mobile
            </div>
          </div>
        </div>
      </div>

      {/* Forms Table / Detailed Performance */}
      <div
        style={{
          background: '#0B0F19',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 18,
          padding: '24px 28px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px' }}>
              Form Performance & Submissions Breakdown
            </h3>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>Detailed responses per form</span>
          </div>
          <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
            {forms.length} {forms.length === 1 ? 'Form' : 'Forms'} Tracked
          </span>
        </div>

        {forms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
            <FileText size={36} color="#64748B" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: '#F8FAFC', fontSize: 16, marginBottom: 6 }}>No Forms Created Yet</h4>
            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>
              Create your first form to start capturing responses and analytics.
            </p>
            <Link href="/builder" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: 8 }}>
              Create Form
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94A3B8', fontWeight: 600 }}>Form Name</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94A3B8', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Submissions</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94A3B8', fontWeight: 600 }}>Created Date</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94A3B8', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => {
                  const formRespCount = responses.filter((r) => r.form_id === form.id).length;
                  return (
                    <tr key={form.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                        {form.title}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 12,
                            background:
                              form.status === 'published'
                                ? 'rgba(52, 211, 153, 0.1)'
                                : 'rgba(255, 255, 255, 0.06)',
                            color: form.status === 'published' ? '#34D399' : '#94A3B8',
                          }}
                        >
                          {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: formRespCount > 0 ? '#38BDF8' : '#94A3B8',
                          }}
                        >
                          {formRespCount}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: '#94A3B8' }}>{formatDate(form.created_at)}</td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Link
                            href={`/dashboard/forms/${form.id}/responses`}
                            className="btn btn-ghost btn-sm"
                            title="View Submissions"
                            style={{ fontSize: 12, color: '#818CF8' }}
                          >
                            Responses ({formRespCount})
                          </Link>
                          <Link
                            href={`/builder?id=${form.id}`}
                            className="btn btn-ghost btn-sm"
                            title="Edit in Studio Builder"
                            style={{ fontSize: 12, color: '#F8FAFC' }}
                          >
                            <Edit2 size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .analytics-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
