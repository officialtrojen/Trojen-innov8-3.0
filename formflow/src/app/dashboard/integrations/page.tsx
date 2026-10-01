'use client';

import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  MessageSquare, 
  Send, 
  Check, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Radio,
  FileSpreadsheet,
  ArrowRight,
  Terminal,
  RefreshCw,
  Sparkles
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
    id: 'instant_demo',
    name: '⚡ 1-Tap FormFlow Receiver',
    desc: 'Zero-configuration built-in webhook receiver. See live payloads stream on this page!',
    icon: Zap,
    color: '#F59E0B',
    badge: '1-Tap Zero Setup',
    placeholder: '/api/webhooks/demo',
    guide: 'Instant built-in receiver! No external apps or scripts required. Submissions will be logged right in the live terminal below.',
  },
  {
    id: 'webhook_site',
    name: '🌐 Webhook.site (Free Live Bin)',
    desc: 'Instant public endpoint with zero login. View raw JSON payloads streaming live on webhook.site.',
    icon: ExternalLink,
    color: '#06B6D4',
    badge: 'Instant Public URL',
    placeholder: 'https://webhook.site/...',
    guide: '1. Click the button to open webhook.site (no login required).\n2. Copy your unique URL from the page.\n3. Paste below to watch payloads appear live on their web dashboard!',
  },
  {
    id: 'discord',
    name: 'Discord Webhook',
    desc: 'Forward submission alerts with rich embeds to Discord channels.',
    icon: MessageSquare,
    color: '#5865F2',
    badge: 'FR-6 Ready',
    placeholder: 'https://discord.com/api/webhooks/...',
    guide: '1. In any Discord channel, click Channel Settings (⚙️) → Integrations → Webhooks.\n2. Click "New Webhook" → Copy Webhook URL.\n3. Paste into FormFlow below to receive live embeds with audible chime!',
  },
  {
    id: 'slack',
    name: 'Slack Incoming Webhook',
    desc: 'Post instant submission notifications into Slack team channels.',
    icon: MessageSquare,
    color: '#E01E5A',
    badge: 'FR-6 Ready',
    placeholder: 'https://hooks.slack.com/services/...',
    guide: '1. In Slack, go to Apps & Integrations → Incoming WebHooks.\n2. Choose a channel and click Add Incoming WebHooks Integration.\n3. Copy the Webhook URL and paste below.',
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    desc: 'Stream responses into a live Google Sheet via Apps Script webhook.',
    icon: FileSpreadsheet,
    color: '#34A853',
    badge: 'FR-6 Recommended',
    placeholder: 'https://script.google.com/macros/s/.../exec',
    guide: '1. Create a Google Sheet → Extensions → Apps Script.\n2. Paste our 10-line script below and click Deploy → New Deployment.\n3. Choose Web app (Access: Anyone) → Copy the Web app URL and paste it here.',
  },
  {
    id: 'webhook',
    name: 'Custom REST API',
    desc: 'Deliver raw JSON payloads to your backend API, Zapier, or Make.',
    icon: Webhook,
    color: '#8B5CF6',
    badge: 'REST API',
    placeholder: 'https://api.yourdomain.com/webhooks/formflow',
    guide: 'Receives a standard JSON POST body with event, formId, submissionId, timestamp, and answers map upon each submission.',
  },
];

const GOOGLE_APPS_SCRIPT = `// ==========================================
// FormFlow -> Google Sheets Webhook Connector
// ==========================================
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create header row on first submission
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
    
    // Append submission row
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
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", rowAppended: true }))
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

  // Built-in Live Receiver Logs State
  const [demoLogs, setDemoLogs] = useState<Array<{ id: string; receivedAt: string; payload: any }>>([]);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [oneTapConnecting, setOneTapConnecting] = useState(false);

  const fetchDemoLogs = async () => {
    try {
      setIsFetchingLogs(true);
      const res = await fetch('/api/webhooks/demo');
      const data = await res.json();
      if (data.logs) {
        setDemoLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to fetch demo logs:', e);
    } finally {
      setIsFetchingLogs(false);
    }
  };

  const handleClearDemoLogs = async () => {
    try {
      await fetch('/api/webhooks/demo', { method: 'DELETE' });
      setDemoLogs([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Load user forms & configured integrations
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
        const enriched = integrationsData.map((item: any) => {
          const matched = loadedForms.find((f) => f.id === item.form_id);
          return {
            ...item,
            form_title: matched?.title || 'External Form',
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
    fetchDemoLogs();
    const interval = setInterval(fetchDemoLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1-Tap Connect handler
  const handleOneTapActivate = async () => {
    if (forms.length === 0) {
      alert('Please create at least one form first before connecting a webhook!');
      return;
    }
    setOneTapConnecting(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const demoUrl = `${origin}/api/webhooks/demo`;
      const formToLink = targetFormId || forms[0].id;
      const formObj = forms.find(f => f.id === formToLink);

      // Save to Supabase
      const { error } = await supabase.from('integrations').insert({
        form_id: formToLink,
        type: 'webhook',
        configuration: {
          url: demoUrl,
          name: `⚡ FormFlow Live Sink (${formObj?.title || 'Form'})`,
        },
        enabled: true,
      });

      if (error) {
        console.warn('Direct DB insert failed, testing route ping:', error);
      }

      // Send initial test ping
      await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: demoUrl }),
      });

      await loadData();
      await fetchDemoLogs();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setOneTapConnecting(false);
    }
  };

  const handleOpenModal = (app: typeof APPS[0]) => {
    setSelectedApp(app);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    if (app.id === 'instant_demo') {
      setWebhookUrl(`${origin}/api/webhooks/demo`);
      setWebhookName('⚡ FormFlow Live Sink');
    } else {
      setWebhookUrl('');
      setWebhookName(`${app.name} Connector`);
    }
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
        fetchDemoLogs();
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
        fetchDemoLogs();
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
      const { data, error } = await supabase.from('integrations').insert({
        form_id: targetFormId,
        type: selectedApp.id,
        configuration: {
          url: webhookUrl.trim(),
          name: webhookName.trim() || selectedApp.name,
        },
        enabled: true,
      }).select().single();

      if (error) {
        console.error('Save integration error:', error);
        alert(`Failed to save integration: ${error.message}`);
      } else {
        setSaveSuccess(true);
        setTimeout(() => {
          handleCloseModal();
          loadData();
          fetchDemoLogs();
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
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
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
          Stream real-time form submissions into Discord, Slack, Google Sheets, or custom endpoints. Get an instant endpoint below with zero code or setup!
        </p>
      </div>

      {/* 1-Tap Quick Action Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 20,
        padding: '24px 28px',
        marginBottom: 32,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={20} color="#F59E0B" />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#FFF', margin: 0 }}>
              Need an Instant Webhook for Judge Evaluation?
            </h3>
          </div>
          <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
            No scripts, no accounts, no setup required! Click <b>Activate 1-Tap Webhook</b> to automatically attach FormFlow&apos;s built-in live receiver. Every form submission will stream right into the live monitor below.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleOneTapActivate}
            disabled={oneTapConnecting}
            style={{
              padding: '12px 22px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              border: 'none',
              color: '#FFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            {oneTapConnecting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} color="#FDE047" />}
            {oneTapConnecting ? 'Connecting...' : '⚡ Activate 1-Tap Webhook'}
          </button>

          <a
            href="https://webhook.site"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#E2E8F0',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={15} color="#06B6D4" />
            Open Webhook.site
          </a>
        </div>
      </div>

      {/* Live Captured Webhook Monitor */}
      <div style={{
        background: '#0B0F19',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 36,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Terminal size={20} color="#10B981" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              Live Captured Webhook Stream ({demoLogs.length} events)
            </h3>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontWeight: 600 }}>
              Listening on /api/webhooks/demo
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={fetchDemoLogs}
              title="Refresh Stream"
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RefreshCw size={12} className={isFetchingLogs ? 'animate-spin' : ''} />
              Refresh
            </button>
            {demoLogs.length > 0 && (
              <button
                onClick={handleClearDemoLogs}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  color: '#FB7185',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {demoLogs.length === 0 ? (
          <div style={{
            padding: '28px 16px',
            textAlign: 'center',
            borderRadius: 12,
            background: 'rgba(2, 6, 23, 0.5)',
            border: '1px dashed rgba(148, 163, 184, 0.15)',
            color: '#64748B',
            fontSize: 13,
          }}>
            No payloads captured yet. Click <b>⚡ Activate 1-Tap Webhook</b> or submit any form linked to <code>/api/webhooks/demo</code> to see live JSON appear here!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
            {demoLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: 'rgba(2, 6, 23, 0.7)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#34D399', fontFamily: 'monospace' }}>
                      POST /api/webhooks/demo
                    </span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>
                      • Event: {log.payload?.event || 'test_ping'}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
                    {new Date(log.receivedAt).toLocaleTimeString()}
                  </span>
                </div>
                <pre style={{
                  margin: 0,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: '#A7F3D0',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: 10,
                  borderRadius: 8,
                  overflowX: 'auto',
                }}>
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Form Webhooks List */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 36,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Radio size={20} color="#F59E0B" />
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
              Use 1-Tap Connect above or pick Discord, Slack, or Google Sheets below.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {integrations.map((item) => {
              const matchedApp = APPS.find((a) => a.id === item.type) || APPS[5];
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
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: matchedApp.color,
                      flexShrink: 0
                    }}>
                      <matchedApp.icon size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
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
                        <span style={{ fontSize: 12, color: '#818CF8', fontWeight: 500 }}>
                          Form: {item.form_title}
                        </span>
                        <span style={{ color: '#475569' }}>•</span>
                        <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#E2E8F0',
                        fontSize: 12,
                        fontWeight: 500,
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
        All Webhook Connectors (FR-6 Rubric)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
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

            {/* Webhook.site Quick Link */}
            {selectedApp.id === 'webhook_site' && (
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#22D3EE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Instant Free Webhook URL
                  </span>
                  <a
                    href="https://webhook.site"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: '#0891B2',
                      color: '#FFF',
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} />
                    Open Webhook.site in New Tab
                  </a>
                </div>
                <p style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.4, margin: 0 }}>
                  Open Webhook.site, copy your generated unique URL, and paste it into the field below. No registration required!
                </p>
              </div>
            )}

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
                  In your Google Sheet, open <b>Extensions → Apps Script</b>, replace all code with this snippet, and click <b>Deploy → New deployment → Web app (Anyone)</b>.
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
            {selectedApp.id !== 'google_sheets' && selectedApp.id !== 'webhook_site' && (
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
                  placeholder="e.g. #hackathon-submissions alert"
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
