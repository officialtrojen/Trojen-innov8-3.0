'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm, DBResponse } from '@/lib/types';
import { formatDateTime, responsesToCSV, downloadFile, responsesToExcel } from '@/lib/utils';
import { Download, Trash2, Eye, Search, X, FileSpreadsheet } from 'lucide-react';

export default function ResponsesPage() {
  const params = useParams();
  const { user } = useAuth();
  const supabase = createClient();
  const formId = params.id as string;

  const [form, setForm] = useState<DBForm | null>(null);
  const [responses, setResponses] = useState<DBResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingResponse, setViewingResponse] = useState<DBResponse | null>(null);

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
        .order('submitted_at', { ascending: false });

      setResponses((respData || []) as DBResponse[]);
      setLoading(false);
    }

    load();

    // Realtime subscription
    const channel = supabase
      .channel(`responses-${formId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses', filter: `form_id=eq.${formId}` }, (payload) => {
        setResponses((prev) => [payload.new as DBResponse, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formId, user, supabase]);

  const handleExport = () => {
    if (!form || responses.length === 0) return;
    const fields = form.schema.fields.map((f) => ({ id: f.id, label: f.label }));
    const csv = responsesToCSV(fields, responses);
    downloadFile(csv, `${form.title.replace(/\s+/g, '_')}_responses.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportExcel = () => {
    if (!form || responses.length === 0) return;
    const fields = form.schema.fields.map((f) => ({ id: f.id, label: f.label, type: f.type }));
    responsesToExcel(form.title, fields, responses);
  };

  const handleDelete = async (responseId: string) => {
    if (!confirm('Delete this response?')) return;
    await supabase.from('responses').delete().eq('id', responseId);
    setResponses((prev) => prev.filter((r) => r.id !== responseId));
  };

  const filteredResponses = responses.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return JSON.stringify(r.answers).toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  if (!form) return <div>Form not found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#263B3B', marginBottom: 4 }}>Responses</h1>
          <p style={{ color: '#52796F', fontSize: 14 }}>{form.title} — {responses.length} response{responses.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExportExcel} className="btn btn-primary btn-sm" disabled={responses.length === 0} style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button onClick={handleExport} className="btn btn-secondary btn-sm" disabled={responses.length === 0}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#B8CECF' }} />
        <input
          className="input"
          placeholder="Search responses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {filteredResponses.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: '#52796F', fontSize: 14 }}>
            {responses.length === 0 ? 'No responses yet. Share your form to start collecting.' : 'No matching responses.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(184,206,207,0.3)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#52796F', fontWeight: 500, fontSize: 12 }}>#</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#52796F', fontWeight: 500, fontSize: 12 }}>Submitted</th>
                  {form.schema.fields.slice(0, 4).map((f) => (
                    <th key={f.id} style={{ padding: '10px 14px', textAlign: 'left', color: '#52796F', fontWeight: 500, fontSize: 12, maxWidth: 200 }}>
                      {f.label}
                    </th>
                  ))}
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#52796F', fontWeight: 500, fontSize: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((resp, i) => (
                  <tr key={resp.id} style={{ borderBottom: '1px solid rgba(184,206,207,0.15)' }}>
                    <td style={{ padding: '10px 14px', color: '#B8CECF' }}>{responses.length - i}</td>
                    <td style={{ padding: '10px 14px', color: '#52796F', whiteSpace: 'nowrap' }}>{formatDateTime(resp.submitted_at)}</td>
                    {form.schema.fields.slice(0, 4).map((f) => {
                      const val = resp.answers[f.id];
                      const display = val === null || val === undefined ? '—'
                        : Array.isArray(val) ? val.join(', ')
                        : String(val);
                      return (
                        <td key={f.id} style={{ padding: '10px 14px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {display}
                        </td>
                      );
                    })}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => setViewingResponse(resp)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDelete(resp.id)} className="btn btn-ghost btn-sm" style={{ padding: 4, color: '#e74c3c' }}>
                          <Trash2 size={14} />
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

      {/* Response detail modal */}
      {viewingResponse && (
        <div className="modal-overlay" onClick={() => setViewingResponse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#263B3B' }}>Response Details</h2>
              <button onClick={() => setViewingResponse(null)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#52796F', marginBottom: 20 }}>
              Submitted: {formatDateTime(viewingResponse.submitted_at)}
            </div>
            {form.schema.fields.map((field) => {
              const val = viewingResponse.answers[field.id];
              return (
                <div key={field.id} style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, background: 'var(--accent)' }}>
                  <div style={{ fontSize: 12, color: '#52796F', fontWeight: 500, marginBottom: 4 }}>{field.label}</div>
                  <div style={{ fontSize: 14, color: '#263B3B' }}>
                    {val === null || val === undefined ? <span style={{ color: '#B8CECF' }}>Not answered</span>
                      : Array.isArray(val) ? val.join(', ')
                      : String(val)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
