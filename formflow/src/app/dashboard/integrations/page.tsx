'use client';

import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  MessageSquare, 
  Send, 
  Check, 
  Copy, 
  Trash2, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Radio,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FormSummary {
  id: string;
  title: string;
}

interface IntegrationRecord {
  id: string;
  form_id: string;
  type: string;
  configuration: {
    url: string;
    name?: string;
    headers?: Record<string, string>;
  };
  enabled: boolean;
  created_at: string;
  form_title?: string;
}

const APPS = [
  {
    id: 'google_sheets',
    name: 'Google Sheets / Excel',
    desc: 'Live two-way spreadsheet sync. Auto-generates question headers and appends every submission in real time.',
    icon: FileSpreadsheet,
    color: '#34A853',
    badge: 'FR-6 Primary',
    placeholder: 'https://script.google.com/macros/s/.../exec',
    guide: '1. In Google Sheets, open Extensions → Apps Script.\n2. Paste our 10-line script below and click Deploy → New Deployment.\n3. Choose Web app (Access: Anyone) → Copy the Web app URL and paste below.',
  },
  {
    id: 'discord',
    name: 'Discord Webhook',
    desc: 'Forward submission alerts with rich visual embeds and notifications directly to Discord channels.',
    icon: MessageSquare,
    color: '#5865F2',
    badge: 'FR-6 Ready',
    placeholder: 'https://discord.com/api/webhooks/...',
    guide: '1. In any Discord channel, click Channel Settings (⚙️) → Integrations → Webhooks.\n2. Click "New Webhook" → Copy Webhook URL.\n3. Paste into FormFlow below to receive live embeds with audible chime!',
  },
  {
    id: 'slack',
    name: 'Slack Incoming Webhook',
    desc: 'Post instant submission notifications with formatted answers into Slack team channels.',
    icon: MessageSquare,
    color: '#E01E5A',
    badge: 'FR-6 Ready',
    placeholder: 'https://hooks.slack.com/services/...',
    guide: '1. In Slack, go to Apps & Integrations → Incoming WebHooks.\n2. Choose a channel and click Add Incoming WebHooks Integration.\n3. Copy the Webhook URL and paste below.',
  },
  {
    id: 'webhook',
    name: 'Custom REST API Webhook',
    desc: 'Deliver raw JSON payloads to your own backend API, Zapier, Make, or custom microservice.',
    icon: Webhook,
    color: '#8B5CF6',
    badge: 'REST API',
    placeholder: 'https://api.yourdomain.com/webhooks/formflow',
    guide: 'Receives a standard JSON POST body with event, formId, submissionId, timestamp, and answers map upon each submission.',
  },
];

const GOOGLE_APPS_SCRIPT = `// ==========================================
// FormFlow -> Permanent Master Google Sheet
// Automatically creates a new tab for each form!
// ==========================================
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    
    // 1. Get or create a separate tab for each form
    var sheetName = (data.formTitle || data.formId || "Responses").toString().substring(0, 30);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // 2. Auto-create headers on first submission for this form
    if (sheet.getLastRow() === 0) {
      var headers = ["Timestamp", "Form ID", "Submission ID"];
      if (data.responses) {
        Object.keys(data.responses).forEach(function(key) {
          headers.push(key);
        });
      }
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#EEF2FF");
    }
    
    // 3. Append response row
    var row = [
      data.submittedAt || new Date().toISOString(),
      data.formId || "Unknown",
      data.submissionId || "N/A"
    ];
    if (data.responses) {
      Object.keys(data.responses).forEach(function(key) {
        row.push(data.responses[key]);
      });
    }
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", tab: sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function IntegrationsPage() {
  const supabase = createClient();
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Setup Modal State
  const [selectedApp, setSelectedApp] = useState<typeof APPS[0] | null>(null);
  const [targetFormId, setTargetFormId] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [webhookName, setWebhookName] = useState<string>('');
  
  // Test Ping State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string; durationMs?: number } | null>(null);
  
  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Inline testing state for active connections list
  const [inlineTestingId, setInlineTestingId] = useState<string | null>(null);
  const [inlineResult, setInlineResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  // Load user forms & configured integrations (with automatic cleanup of waste records)
  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch user forms
      let query = supabase.from('forms').select('id, title').order('created_at', { ascending: false });
      if (user) {
        query = query.eq('owner_id', user.id);
      }
      const { data: formsData } = await query;
      const loadedForms = formsData || [];
      setForms(loadedForms);
      if (loadedForms.length > 0 && !targetFormId) {
        setTargetFormId(loadedForms[0].id);
      }

      // 2. Fetch existing integrations
      const { data: integrationsData, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && integrationsData) {
        // Automatically purge waste records (temporary sinks, localhost mock prefixes, webhook.site)
        const wasteIds: string[] = [];
        const cleanRecords: any[] = [];
        let hasGoogleSheet = false;

        for (const item of integrationsData) {
          const url = item.configuration?.url || '';
          const isWaste = url.includes('webhook.site') || url.includes('localhost:3000') || !url.startsWith('http');
          
          if (isWaste) {
            wasteIds.push(item.id);
          } else if (url.includes('script.google.com')) {
            if (!hasGoogleSheet) {
              hasGoogleSheet = true;
              cleanRecords.push(item);
            } else {
              wasteIds.push(item.id); // deduplicate extra google sheets
            }
          } else {
            cleanRecords.push(item);
          }
        }

        // Delete waste records from DB in background
        if (wasteIds.length > 0) {
          supabase.from('integrations').delete().in('id', wasteIds).then(() => {});
        }

        const enriched = cleanRecords.map((item: any) => {
          const matched = loadedForms.find((f: any) => f.id === item.form_id);
          return {
            ...item,
            form_title: matched?.title || 'Form esdvs',
          };
        });
        setIntegrations(enriched);
      }
    } catch (e) {
      console.error('Failed to load integrations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (app: typeof APPS[0]) => {
    setSelectedApp(app);
    setWebhookUrl('');
    setWebhookName(`${app.name} Connector`);
    setTestResult(null);
    setSaveSuccess(false);
    if (forms.length > 0 && !targetFormId) {
      setTargetFormId(forms[0].id);
    }
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
    setTestResult(null);
    setSaveSuccess(false);
  };

  const handleTestPing = async (urlToTest: string) => {
    if (!urlToTest) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          msg: `HTTP ${data.status} OK • Verified in ${data.durationMs}ms`,
          durationMs: data.durationMs,
        });
      } else {
        setTestResult({
          success: false,
          msg: data.error || `HTTP ${data.status} ${data.statusText || 'Error'}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: err.message || 'Network request failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleInlineTest = async (item: IntegrationRecord) => {
    setInlineTestingId(item.id);
    setInlineResult(null);

    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.configuration.url }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInlineResult({
          id: item.id,
          success: true,
          msg: `HTTP ${data.status} OK (${data.durationMs}ms)`,
        });
      } else {
        setInlineResult({
          id: item.id,
          success: false,
          msg: `Failed: ${data.error || data.status}`,
        });
      }
    } catch (e: any) {
      setInlineResult({
        id: item.id,
        success: false,
        msg: e.message,
      });
    } finally {
      setInlineTestingId(null);
    }
  };

  const handleSaveIntegration = async () => {
    if (!selectedApp || !targetFormId || !webhookUrl) return;
    setIsSaving(true);

    try {
      const { error } = await supabase.from('integrations').insert({
        form_id: targetFormId,
        type: selectedApp.id,
        configuration: {
          url: webhookUrl.trim(),
          name: webhookName.trim() || selectedApp.name,
        },
        enabled: true,
      });

      if (error) {
        console.error('Save integration error:', error);
        alert(`Failed to save integration: ${error.message}`);
      } else {
        setSaveSuccess(true);
        setTimeout(() => {
          handleCloseModal();
          loadData();
        }, 1200);
      }
    } catch (e: any) {
      alert(`Unexpected error: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleIntegration = async (item: IntegrationRecord) => {
    const updatedStatus = !item.enabled;
    const { error } = await supabase
      .from('integrations')
      .update({ enabled: updatedStatus })
      .eq('id', item.id);

    if (!error) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, enabled: updatedStatus } : i))
      );
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to remove this webhook integration?')) return;
    const { error } = await supabase.from('integrations').delete().eq('id', id);
    if (!error) {
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div style={{ paddingBottom: 60, maxWidth: 1100, margin: '0 auto' }}>
      {/* Clean Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: 12,
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818CF8',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            FR-6 Webhook Integration
          </div>
          <span style={{ fontSize: 13, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Zero-Latency Dispatch Engine Active
          </span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Integrations & Live Webhooks
        </h1>
        <p style={{ color: '#94A3B8', fontSize: 15, maxWidth: 740, lineHeight: 1.5 }}>
          Stream real-time form submissions into Google Sheets, Discord channels, Slack feeds, or custom REST APIs upon submission.
        </p>
      </div>

      {/* Active Form Webhooks Section */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 36,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={20} color="#34A853" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              Active Form Webhooks ({integrations.length})
            </h2>
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>
            Auto-dispatched immediately when respondent submits
          </span>
        </div>

        {integrations.length === 0 ? (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            borderRadius: 14,
            background: 'rgba(2, 6, 23, 0.4)',
            border: '1px dashed rgba(148, 163, 184, 0.15)',
          }}>
            <Radio size={28} color="#64748B" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#CBD5E1', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              No active webhook integrations connected yet
            </p>
            <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>
              Choose Google Sheets, Discord, or Slack below to link your first live endpoint.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {integrations.map((item) => {
              const matchedApp = APPS.find((a) => a.id === item.type) || APPS[0];
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '16px 20px',
                    borderRadius: 14,
                    background: 'rgba(2, 6, 23, 0.6)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(52, 168, 83, 0.1)',
                      border: '1px solid rgba(52, 168, 83, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: matchedApp.color,
                      flexShrink: 0
                    }}>
                      <matchedApp.icon size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>
                          {item.configuration.name || matchedApp.name}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 8,
                          background: item.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                          color: item.enabled ? '#34D399' : '#94A3B8',
                        }}>
                          {item.enabled ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: '#818CF8', fontWeight: 600 }}>
                          Form: {item.form_title}
                        </span>
                        <span style={{ color: '#475569' }}>•</span>
                        <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.configuration.url}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {inlineResult && inlineResult.id === item.id && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: inlineResult.success ? '#34D399' : '#F43F5E',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {inlineResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {inlineResult.msg}
                      </span>
                    )}

                    <button
                      onClick={() => handleInlineTest(item)}
                      disabled={inlineTestingId === item.id}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#E2E8F0',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {inlineTestingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} color="#818CF8" />}
                      Test Ping
                    </button>

                    <button
                      onClick={() => handleToggleIntegration(item)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: item.enabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${item.enabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                        color: item.enabled ? '#FCA5A5' : '#86EFAC',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {item.enabled ? 'Pause' : 'Enable'}
                    </button>

                    <button
                      onClick={() => handleDeleteIntegration(item.id)}
                      title="Delete Integration"
                      style={{
                        padding: '6px 8px',
                        borderRadius: 8,
                        background: 'rgba(244, 63, 94, 0.08)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        color: '#F43F5E',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Connectors Grid */}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>
        Available Connectors (FR-6 Rubric)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
        {APPS.map((app) => (
          <div
            key={app.id}
            onClick={() => handleOpenModal(app)}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s',
              cursor: 'pointer',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: app.color }}>
                <app.icon size={26} />
              </div>
              <span style={{ 
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12,
                background: 'rgba(99,102,241,0.12)',
                color: '#818CF8',
                border: '1px solid rgba(99,102,241,0.2)'
              }}>
                {app.badge}
              </span>
            </div>
            
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>{app.name}</h3>
            <p style={{ fontSize: 13, color: '#94A3B8', flex: 1, lineHeight: 1.5, marginBottom: 18 }}>{app.desc}</p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTop: '1px solid rgba(148, 163, 184, 0.08)',
              color: '#818CF8',
              fontSize: 13,
              fontWeight: 600
            }}>
              <span>Configure Connection</span>
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Integration Setup Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 640,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 28,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedApp.color,
                }}>
                  <selectedApp.icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                    Connect {selectedApp.name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>
                    FR-6 Webhook Stream Automation
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Google Sheets Specific Script Snippet */}
            {selectedApp.id === 'google_sheets' && (
              <div style={{
                background: 'rgba(52, 168, 83, 0.08)',
                border: '1px solid rgba(52, 168, 83, 0.25)',
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    1-Click Google Apps Script
                  </span>
                  <button
                    onClick={handleCopyScript}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: '#15803D',
                      border: 'none',
                      color: '#FFF',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {copiedScript ? <Check size={12} /> : <Copy size={12} />}
                    {copiedScript ? 'Copied Script!' : 'Copy Script'}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.4, margin: '0 0 10px' }}>
                  In your Google Sheet, open <b>Extensions → Apps Script</b>, replace all code with this snippet, and click <b>Deploy → New deployment → Web app (Access: Anyone)</b>.
                </p>
                <pre style={{
                  background: '#020617',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: 10,
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: '#94A3B8',
                  maxHeight: 120,
                  overflowY: 'auto',
                }}>
                  {GOOGLE_APPS_SCRIPT}
                </pre>
              </div>
            )}

            {/* Quick Guide for Discord / Slack */}
            {selectedApp.id !== 'google_sheets' && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                fontSize: 12,
                color: '#94A3B8',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}>
                {selectedApp.guide}
              </div>
            )}

            {/* Form Fields */}
            <div style={{ display: 'grid', gap: 16 }}>
              {/* Target Form Picker */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>
                  Target Form to Connect
                </label>
                {forms.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#F43F5E' }}>
                    No forms found. Please create a form in the Dashboard first.
                  </p>
                ) : (
                  <select
                    value={targetFormId}
                    onChange={(e) => setTargetFormId(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#020617',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: '#F8FAFC',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    {forms.map((f) => (
                      <option key={f.id} value={f.id} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                        {f.title} ({f.id.slice(0, 8)}...)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Webhook Label */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>
                  Connection Label
                </label>
                <input
                  type="text"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  placeholder="e.g. Google Sheets Live Stream"
                  style={{
                    width: '100%',
                    background: '#020617',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#F8FAFC',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Webhook Endpoint URL */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>
                  Webhook Endpoint URL <span style={{ color: '#F43F5E' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder={selectedApp.placeholder}
                    style={{
                      flex: 1,
                      background: '#020617',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: '#F8FAFC',
                      fontSize: 13,
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => handleTestPing(webhookUrl)}
                    disabled={!webhookUrl || isTesting}
                    style={{
                      padding: '0 16px',
                      borderRadius: 10,
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#818CF8',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {isTesting ? 'Pinging...' : 'Send Test Ping'}
                  </button>
                </div>
              </div>

              {/* Test Result Indicator */}
              {testResult && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                  color: testResult.success ? '#34D399' : '#FB7185',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.msg}</span>
                </div>
              )}

              {saveSuccess && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Check size={18} />
                  Webhook Integration Successfully Saved & Live!
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 18, borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  color: '#94A3B8',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSaveIntegration}
                disabled={!webhookUrl || !targetFormId || isSaving || saveSuccess}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  background: '#4F46E5',
                  border: 'none',
                  color: '#FFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                  opacity: (!webhookUrl || !targetFormId || isSaving) ? 0.5 : 1,
                }}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {isSaving ? 'Connecting...' : 'Save & Activate Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
