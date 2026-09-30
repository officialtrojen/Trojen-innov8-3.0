'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Globe,
  MessageSquare,
  TrendingUp,
  PlusCircle,
  MoreHorizontal,
  Edit3,
  Eye,
  BarChart3,
  Copy,
  Trash2,
  Sparkles,
  Share2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm, DashboardStats } from '@/lib/types';
import { formatDate, truncate } from '@/lib/utils';
import ShareModal from '@/components/builder/ShareModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({ totalForms: 0, publishedForms: 0, totalResponses: 0, avgResponseRate: 0 });
  const [forms, setForms] = useState<DBForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalForm, setShareModalForm] = useState<DBForm | null>(null);

  useEffect(() => {
    async function load() {
      let ownerId = user?.id;
      if (!ownerId) {
        const { data: authData } = await supabase.auth.getUser();
        ownerId = authData?.user?.id;
      }
      if (!ownerId && typeof window !== 'undefined') {
        ownerId = localStorage.getItem('formflow_guest_id') || undefined;
      }

      if (!ownerId) {
        setForms([]);
        setLoading(false);
        return;
      }

      // If user logged in and has guest forms, migrate them
      if (user?.id && typeof window !== 'undefined') {
        const guestId = localStorage.getItem('formflow_guest_id');
        if (guestId && guestId !== user.id) {
          await supabase.from('forms').update({ owner_id: user.id }).eq('owner_id', guestId);
          localStorage.removeItem('formflow_guest_id');
        }
      }

      // Load forms
      const { data: formsData } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', ownerId)
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
        avgResponseRate: allForms.length > 0 ? Math.round((totalResponses / Math.max(allForms.length, 1)) * 10) / 10 : 0,
      });

      setLoading(false);
    }

    load();

    // Subscribe to realtime updates on forms and responses
    const formsChannel = supabase
      .channel('dashboard-forms-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forms' },
        () => {
          load();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'responses' },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(formsChannel);
    };
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
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Forms', value: stats.totalForms, icon: FileText, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
    { label: 'Published Forms', value: stats.publishedForms, icon: Globe, color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)' },
    { label: 'Total Responses', value: stats.totalResponses, icon: MessageSquare, color: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)' },
    { label: 'Avg per Form', value: stats.avgResponseRate, icon: TrendingUp, color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', marginBottom: 4, letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Welcome back! Here&apos;s an overview of your forms.</p>
        </div>
        <Link href="/builder" className="btn btn-primary">
          <PlusCircle size={18} /> Create Form
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={18} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#F8FAFC' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent forms */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F8FAFC' }}>Recent Forms</h2>
        <Link href="/dashboard/forms" style={{ color: '#38BDF8', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
          View All →
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <FileText size={40} style={{ color: '#64748B', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F8FAFC', marginBottom: 8 }}>No forms yet</h3>
          <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>Create your first form to get started.</p>
          <Link href="/builder" className="btn btn-primary">
            <PlusCircle size={18} /> Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94A3B8', fontWeight: 500, fontSize: 13 }}>Form Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94A3B8', fontWeight: 500, fontSize: 13 }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94A3B8', fontWeight: 500, fontSize: 13 }}>Updated</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: '#94A3B8', fontWeight: 500, fontSize: 13 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#F8FAFC' }}>
                      {truncate(form.title, 40)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${form.status}`}>
                        {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94A3B8' }}>{formatDate(form.updated_at)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <Link href={`/dashboard/forms/${form.id}/edit`} className="btn btn-ghost btn-sm" title="Edit">
                          <Edit3 size={15} />
                        </Link>
                        <Link href={`/dashboard/forms/${form.id}/preview`} className="btn btn-ghost btn-sm" title="Preview">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/dashboard/forms/${form.id}/responses`} className="btn btn-ghost btn-sm" title="Responses">
                          <MessageSquare size={15} />
                        </Link>
                        <button
                          onClick={() => setShareModalForm(form)}
                          className="btn btn-ghost btn-sm"
                          title="Share / Get Public Submission Link"
                          style={{ color: '#38BDF8' }}
                        >
                          <Share2 size={15} />
                        </button>
                        <Link
                          href={`/dashboard/forms/${form.id}/analytics`}
                          className="btn btn-ghost btn-sm"
                          title="View Analytics"
                          style={{ color: '#94A3B8' }}
                        >
                          <BarChart3 size={15} />
                        </Link>
                        <button onClick={() => handleDuplicate(form)} className="btn btn-ghost btn-sm" title="Duplicate">
                          <Copy size={15} />
                        </button>
                        <button onClick={() => handleDelete(form.id)} className="btn btn-ghost btn-sm" title="Delete" style={{ color: '#ef4444' }}>
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

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareModalForm}
        onClose={() => setShareModalForm(null)}
        formTitle={shareModalForm?.title || ''}
        publicSlug={shareModalForm?.public_slug || ''}
        formId={shareModalForm?.id}
      />
    </div>
  );
}
