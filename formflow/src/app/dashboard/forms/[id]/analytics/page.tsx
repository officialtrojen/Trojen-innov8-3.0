'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm, DBResponse } from '@/lib/types';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Star } from 'lucide-react';

const COLORS = ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#2DD4BF'];

export default function AnalyticsPage() {
  const params = useParams();
  const { user } = useAuth();
  const supabase = createClient();
  const formId = params.id as string;

  const [form, setForm] = useState<DBForm | null>(null);
  const [responses, setResponses] = useState<DBResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !formId) return;

    async function load() {
      const { data: formData } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('owner_id', user!.id)
        .single();
      if (!formData) return;
      setForm(formData as DBForm);

      const { data: respData } = await supabase
        .from('responses')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: true });

      setResponses((respData || []) as DBResponse[]);
      setLoading(false);
    }
    load();

    // Realtime
    const channel = supabase
      .channel(`analytics-${formId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses', filter: `form_id=eq.${formId}` }, (payload) => {
        setResponses((prev) => [...prev, payload.new as DBResponse]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [formId, user, supabase]);

  // ---------- Computed analytics ----------
  const analytics = useMemo(() => {
    if (!form) return null;

    const totalResponses = responses.length;

    // Submission trend (group by date)
    const trendMap: Record<string, number> = {};
    responses.forEach((r) => {
      const date = new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[date] = (trendMap[date] || 0) + 1;
    });
    const trendData = Object.entries(trendMap).map(([date, count]) => ({ date, count }));

    // Per-field analytics
    const fieldAnalytics = form.schema.fields.map((field) => {
      const answers = responses
        .map((r) => r.answers[field.id])
        .filter((a) => a !== null && a !== undefined && a !== '');

      if (field.type === 'multiple_choice') {
        const optionCounts: Record<string, number> = {};
        (field.options || []).forEach((opt) => { optionCounts[opt] = 0; });
        answers.forEach((a) => {
          if (Array.isArray(a)) {
            a.forEach((v: string) => { optionCounts[v] = (optionCounts[v] || 0) + 1; });
          } else {
            optionCounts[String(a)] = (optionCounts[String(a)] || 0) + 1;
          }
        });
        const chartData = Object.entries(optionCounts).map(([name, value]) => ({ name, value }));
        return { field, type: 'choice' as const, chartData, answeredCount: answers.length };
      }

      if (field.type === 'rating') {
        const nums = answers.map(Number).filter((n) => !isNaN(n));
        const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        const distribution: Record<number, number> = {};
        for (let i = 1; i <= (field.maxStars || 5); i++) distribution[i] = 0;
        nums.forEach((n) => { distribution[n] = (distribution[n] || 0) + 1; });
        const chartData = Object.entries(distribution).map(([rating, count]) => ({ rating: `${rating}★`, count }));
        return { field, type: 'rating' as const, avg: Math.round(avg * 10) / 10, chartData, answeredCount: answers.length };
      }

      if (field.type === 'date_picker') {
        const dateCounts: Record<string, number> = {};
        answers.forEach((a) => {
          const d = new Date(String(a)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dateCounts[d] = (dateCounts[d] || 0) + 1;
        });
        const chartData = Object.entries(dateCounts).map(([date, count]) => ({ date, count }));
        return { field, type: 'date' as const, chartData, answeredCount: answers.length };
      }

      // Text fields
      return { field, type: 'text' as const, answers: answers.map(String).slice(0, 10), answeredCount: answers.length };
    });

    return { totalResponses, trendData, fieldAnalytics };
  }, [form, responses]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  if (!form || !analytics) return <div>Form not found.</div>;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', marginBottom: 4, letterSpacing: '-0.02em' }}>Analytics</h1>
      <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 32 }}>{form.title}</p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#F8FAFC' }}>{analytics.totalResponses}</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Total Responses</div>
        </div>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#F8FAFC' }}>{form.schema.fields.length}</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Questions</div>
        </div>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#F8FAFC' }}>
            {analytics.totalResponses > 0
              ? `${Math.round((analytics.fieldAnalytics.filter((f) => f.answeredCount > 0).length / analytics.fieldAnalytics.length) * 100)}%`
              : '—'}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Response Rate</div>
        </div>
      </div>

      {/* Submission Trend */}
      {analytics.trendData.length > 1 && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F8FAFC', marginBottom: 20 }}>Submission Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#38BDF8" strokeWidth={2} dot={{ fill: '#38BDF8', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-field analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {analytics.fieldAnalytics.map((fa) => (
          <div key={fa.field.id} className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F8FAFC', marginBottom: 4 }}>{fa.field.label}</h3>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>{fa.answeredCount} response{fa.answeredCount !== 1 ? 's' : ''}</div>

            {fa.type === 'choice' && (
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={fa.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} (${(((percent ?? 0) * 100)).toFixed(0)}%)`}>
                        {fa.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={fa.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {fa.type === 'rating' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#F8FAFC' }}>{fa.avg}</span>
                  <Star size={24} fill="#FBBF24" stroke="#FBBF24" />
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>average</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={fa.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="rating" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {fa.type === 'date' && (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={fa.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {fa.type === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {fa.answers.length === 0 ? (
                  <div style={{ color: '#64748B', fontSize: 13 }}>No responses yet</div>
                ) : (
                  fa.answers.map((a, i) => (
                    <div key={i} style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: 13, color: '#F8FAFC' }}>
                      {a}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
