'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Globe,
  MessageSquare,
  TrendingUp,
  PlusCircle,
  Edit3,
  Eye,
  BarChart3,
  Copy,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm, DashboardStats } from '@/lib/types';
import { formatDate, truncate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    publishedForms: 0,
    totalResponses: 0,
    avgResponseRate: 0,
  });
  const [forms, setForms] = useState<DBForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      // Load forms
      const { data: formsData } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', user!.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      const allForms = (formsData || []) as DBForm[];
      setForms(allForms);

      // Load response count
      const formIds = allForms.map((f) => f.id);
      let totalResponses = 0;
      if (formIds.length > 0) {
        const { count } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .in('form_id', formIds);
        totalResponses = count || 0;
      }

      const publishedForms = allForms.filter((f) => f.status === 'published').length;

      setStats({
        totalForms: allForms.length,
        publishedForms,
        totalResponses,
        avgResponseRate:
          allForms.length > 0 ? Math.round((totalResponses / Math.max(allForms.length, 1)) * 10) / 10 : 0,
      });

      setLoading(false);
    }

    load();
  }, [user, supabase]);

  const handleDuplicate = async (form: DBForm) => {
    const { nanoid } = await import('nanoid');
    await supabase.from('forms').insert({
      owner_id: user!.id,
      title: `${form.title} (Copy)`,
      description: form.description,
      schema: form.schema,
      theme: form.theme,
      status: 'draft',
      public_slug: nanoid(7),
    });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    await supabase.from('forms').delete().eq('id', id);
    setForms((f) => f.filter((form) => form.id !== id));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Forms',
      value: stats.totalForms,
      icon: FileText,
      color: '#C084FC',
      bg: 'rgba(192, 132, 252, 0.15)',
      border: 'rgba(192, 132, 252, 0.25)',
    },
    {
      label: 'Published Forms',
      value: stats.publishedForms,
      icon: Globe,
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.25)',
    },
    {
      label: 'Total Responses',
      value: stats.totalResponses,
      icon: MessageSquare,
      color: '#34D399',
      bg: 'rgba(52, 211, 153, 0.15)',
      border: 'rgba(52, 211, 153, 0.25)',
    },
    {
      label: 'Avg per Form',
      value: stats.avgResponseRate,
      icon: TrendingUp,
      color: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.15)',
      border: 'rgba(251, 191, 36, 0.25)',
    },
  ];

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: 6,
              letterSpacing: '-0.5px',
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>
            Welcome back! Here&apos;s an overview of your forms and real-time activity.
          </p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            color: '#FFFFFF',
            padding: '11px 20px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)',
          }}
        >
          <PlusCircle size={18} /> Create Form
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 36,
        }}
      >
        {statCards.map((s, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: '22px 24px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${s.border}`,
              borderRadius: 18,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  color: '#94A3B8',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                {s.label}
              </span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: s.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color,
                }}
              >
                <s.icon size={19} />
              </div>
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.8px',
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Forms Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
          Recent Forms
        </h2>
        <Link
          href="/dashboard/forms"
          style={{
            color: '#A855F7',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View All &rarr;
        </Link>
      </div>

      {/* Empty State or Table */}
      {forms.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 22,
              background: 'rgba(139, 92, 246, 0.16)',
              color: '#A855F7',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
            }}
          >
            <FileText size={34} />
          </div>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 8,
            }}
          >
            No forms created yet
          </h3>
          <p
            style={{
              color: '#94A3B8',
              fontSize: 14,
              maxWidth: 380,
              margin: '0 auto 26px auto',
              lineHeight: 1.5,
            }}
          >
            Build your first drag-and-drop workflow to start collecting live responses and viewing analytics.
          </p>
          <Link
            href="/dashboard/forms/new"
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)',
            }}
          >
            <PlusCircle size={18} /> Create Your First Form
          </Link>
        </div>
      ) : (
        <div
          className="card"
          style={{
            overflow: 'hidden',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 18,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <th
                    style={{
                      padding: '14px 20px',
                      textAlign: 'left',
                      color: '#94A3B8',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    Form Name
                  </th>
                  <th
                    style={{
                      padding: '14px 20px',
                      textAlign: 'left',
                      color: '#94A3B8',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '14px 20px',
                      textAlign: 'left',
                      color: '#94A3B8',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    Updated
                  </th>
                  <th
                    style={{
                      padding: '14px 20px',
                      textAlign: 'right',
                      color: '#94A3B8',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr
                    key={form.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#FFFFFF' }}>
                      {truncate(form.title, 40)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge badge-${form.status}`}>
                        {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#94A3B8' }}>{formatDate(form.updated_at)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link
                          href={`/dashboard/forms/${form.id}/edit`}
                          className="btn btn-ghost btn-sm"
                          title="Edit Form"
                          style={{ color: '#94A3B8' }}
                        >
                          <Edit3 size={15} />
                        </Link>
                        <Link
                          href={`/dashboard/forms/${form.id}/preview`}
                          className="btn btn-ghost btn-sm"
                          title="Preview Form"
                          style={{ color: '#94A3B8' }}
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/dashboard/forms/${form.id}/responses`}
                          className="btn btn-ghost btn-sm"
                          title="View Responses"
                          style={{ color: '#94A3B8' }}
                        >
                          <MessageSquare size={15} />
                        </Link>
                        <Link
                          href={`/dashboard/forms/${form.id}/analytics`}
                          className="btn btn-ghost btn-sm"
                          title="View Analytics"
                          style={{ color: '#94A3B8' }}
                        >
                          <BarChart3 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(form)}
                          className="btn btn-ghost btn-sm"
                          title="Duplicate Form"
                          style={{ color: '#94A3B8' }}
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="btn btn-ghost btn-sm"
                          title="Delete Form"
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
