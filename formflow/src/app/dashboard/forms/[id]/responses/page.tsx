'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { DBForm, DBResponse } from '@/lib/types';
import { formatDateTime, responsesToCSV, downloadFile } from '@/lib/utils';
import { Download, Trash2, Eye, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';

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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses', filter: `form_id=eq.${formId}` }, (payload: any) => {
        setResponses((prev) => [payload.new as DBResponse, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formId, user, supabase]);

  const handleExportCsv = () => {
    if (!form || responses.length === 0) return;
    const fields = form.schema.fields.map((f) => ({ id: f.id, label: f.label }));
    const csv = responsesToCSV(fields, responses);
    downloadFile(csv, `${form.title.replace(/\s+/g, '_')}_responses.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportExcel = () => {
    if (!form || responses.length === 0) return;
    const data = responses.map((r, i) => {
      const row: any = {
        '#': responses.length - i,
        'Submitted At': formatDateTime(r.submitted_at),
      };
      form.schema.fields.forEach(f => {
        let val = r.answers[f.id];
        if (Array.isArray(val)) val = val.join(', ');
        row[f.label] = val === null || val === undefined ? '' : String(val);
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    XLSX.writeFile(wb, `${form.title.replace(/\s+/g, '_')}_responses.xlsx`);
  };

  const handleExportJson = () => {
    if (!form || responses.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(responses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_responses.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', marginBottom: 4, letterSpacing: '-0.02em' }}>Responses</h1>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>{form.title} — {responses.length} response{responses.length !== 1 ? 's' : ''}</p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={responses.length === 0}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#F8FAFC',
              background: 'transparent',
              border: 'none',
              padding: '7px 14px',
              cursor: responses.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: responses.length === 0 ? 0.4 : 1,
            }}
            title="Download Form Responses as CSV"
          >
            <Download size={14} /> Export CSV
          </button>
          <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.1)' }} />
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={responses.length === 0}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#F8FAFC',
              background: 'transparent',
              border: 'none',
              padding: '7px 14px',
              cursor: responses.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: responses.length === 0 ? 0.4 : 1,
            }}
            title="Download Form Responses as Excel (.xlsx)"
          >
            <Download size={14} /> Export Excel
          </button>
          <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.1)' }} />
          <button
            type="button"
            onClick={handleExportJson}
            disabled={responses.length === 0}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#94A3B8',
              background: 'transparent',
              border: 'none',
              padding: '7px 12px',
              cursor: responses.length === 0 ? 'not-allowed' : 'pointer',
              opacity: responses.length === 0 ? 0.4 : 1,
            }}
            title="Download Form Responses as JSON"
          >
            JSON
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
          <p style={{ color: '#94A3B8', fontSize: 14 }}>
            {responses.length === 0 ? 'No responses yet. Share your form to start collecting.' : 'No matching responses.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94A3B8', fontWeight: 500, fontSize: 12 }}>#</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94A3B8', fontWeight: 500, fontSize: 12 }}>Submitted</th>
                  {form.schema.fields.slice(0, 4).map((f) => (
                    <th key={f.id} style={{ padding: '10px 14px', textAlign: 'left', color: '#94A3B8', fontWeight: 500, fontSize: 12, maxWidth: 200 }}>
                      {f.label}
                    </th>
                  ))}
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94A3B8', fontWeight: 500, fontSize: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((resp, i) => (
                  <tr key={resp.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px 14px', color: '#64748B' }}>{responses.length - i}</td>
                    <td style={{ padding: '10px 14px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{formatDateTime(resp.submitted_at)}</td>
                    {form.schema.fields.slice(0, 4).map((f) => {
                      const val = resp.answers[f.id];
                      const display = val === null || val === undefined ? '—'
                        : Array.isArray(val) ? val.join(', ')
                        : String(val);
                      return (
                        <td key={f.id} style={{ padding: '10px 14px', color: '#F8FAFC', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {display}
                        </td>
                      );
                    })}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => setViewingResponse(resp)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDelete(resp.id)} className="btn btn-ghost btn-sm" style={{ padding: 4, color: '#ef4444' }}>
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
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F8FAFC' }}>Response Details</h2>
              <button onClick={() => setViewingResponse(null)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>
              Submitted: {formatDateTime(viewingResponse.submitted_at)}
            </div>
            {form.schema.fields.map((field) => {
              const val = viewingResponse.answers[field.id];
              return (
                <div key={field.id} style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, marginBottom: 4 }}>{field.label}</div>
                  <div style={{ fontSize: 14, color: '#F8FAFC' }}>
                    {val === null || val === undefined ? <span style={{ color: '#64748B' }}>Not answered</span>
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
