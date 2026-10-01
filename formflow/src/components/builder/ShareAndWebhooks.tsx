'use client';

import React, { useState, useEffect } from 'react';
import { FormSchema, WebhookConfig } from '@/types/form';
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  QrCode, 
  Webhook, 
  Check, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Code,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Terminal,
  Radio
} from 'lucide-react';
// @ts-ignore
import QRCode from 'qrcode';

interface ShareAndWebhooksProps {
  form: FormSchema;
  onUpdateWebhooks: (webhooks: WebhookConfig[]) => void;
}

export const ShareAndWebhooks: React.FC<ShareAndWebhooksProps> = ({
  form,
  onUpdateWebhooks,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  
  // Live Payload Previewer State (FR-6)
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<'json' | 'discord' | 'slack'>('json');
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Dynamic responses mock from current form's fields
  const mockResponses = React.useMemo(() => {
    const res: Record<string, any> = {};
    if (form.fields && form.fields.length > 0) {
      form.fields.forEach((field) => {
        if (field.type === 'rating') res[field.label] = 5;
        else if (field.type === 'multiple_choice') res[field.label] = field.options?.[0] || 'Option Selected';
        else if (field.type === 'date') res[field.label] = '2026-10-01';
        else if (field.type === 'file_upload') res[field.label] = 'https://storage.supabase.co/uploads/submission.pdf';
        else res[field.label] = 'Sample respondent answer';
      });
    } else {
      res['Full Name'] = 'Alex Morgan';
      res['Email'] = 'alex@example.com';
      res['Feedback'] = 'Excellent form experience!';
    }
    return res;
  }, [form.fields]);

  const previewPayloadString = React.useMemo(() => {
    const timestamp = new Date().toISOString();
    if (previewFormat === 'discord') {
      return JSON.stringify({
        username: 'FormFlow Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        embeds: [
          {
            title: `🎉 New Form Submission`,
            description: `A new response was submitted for form \`${form.id}\`.`,
            color: 0x8b5cf6,
            fields: Object.entries(mockResponses).map(([k, v]) => ({
              name: String(k),
              value: String(v),
              inline: false,
            })),
            timestamp,
          },
        ],
      }, null, 2);
    } else if (previewFormat === 'slack') {
      const formattedLines = Object.entries(mockResponses).map(([k, v]) => `• *${k}*: ${v}`).join('\n');
      return JSON.stringify({
        text: `🎉 *New Form Submission (${form.id})*\n${formattedLines}`,
      }, null, 2);
    } else {
      return JSON.stringify({
        event: 'form_submission',
        formId: form.id,
        submissionId: 'resp_demo_109283',
        submittedAt: timestamp,
        responses: mockResponses,
        metadata: {
          device: 'desktop',
          durationSeconds: 45,
          referrer: 'https://formflow.app/form/' + form.id,
        },
      }, null, 2);
    }
  }, [previewFormat, mockResponses, form.id]);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(previewPayloadString);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingUrl) return;
    onUpdateWebhooks(
      (form.webhooks || []).map((w) => (w.id === id ? { ...w, url: editingUrl } : w))
    );
    setEditingId(null);
    setEditingUrl('');
  };

  // Form public URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const publicUrl = `${origin}/form/${form.id}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="700" frameborder="0"></iframe>`;

  useEffect(() => {
    QRCode.toDataURL(publicUrl, { width: 220, margin: 2 })
      .then((url: string) => setQrCodeUrl(url))
      .catch((err: any) => console.error('QR code generation error:', err));
  }, [publicUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl) return;
    const newWh: WebhookConfig = {
      id: `wh_${Date.now()}`,
      name: newWebhookName || 'External Webhook',
      url: newWebhookUrl,
      enabled: true,
      event: 'on_submission',
    };
    onUpdateWebhooks([...(form.webhooks || []), newWh]);
    setNewWebhookName('');
    setNewWebhookUrl('');
  };

  const handleDeleteWebhook = (id: string) => {
    onUpdateWebhooks((form.webhooks || []).filter((w) => w.id !== id));
  };

  const handleToggleWebhook = (id: string) => {
    onUpdateWebhooks(
      (form.webhooks || []).map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleTestWebhook = async (wh: WebhookConfig) => {
    setTestingWebhookId(wh.id);
    setTestResult(null);

    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: wh.url }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          id: wh.id,
          success: true,
          msg: `HTTP ${data.status} OK in ${data.durationMs}ms`,
        });
      } else {
        setTestResult({
          id: wh.id,
          success: false,
          msg: `Failed: ${data.error || `HTTP ${data.status}`}`,
        });
      }
    } catch (e: any) {
      setTestResult({
        id: wh.id,
        success: false,
        msg: `Error: ${e.message}`,
      });
    } finally {
      setTestingWebhookId(null);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 max-w-5xl mx-auto text-zinc-100">
      {/* Title */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Shareable Link & Custom Webhooks</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Publish your form to respondents and stream real-time submissions into Discord, Slack, or APIs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Public URL & QR Code (FR-4) */}
        <div className="space-y-6">
          {/* Share Link Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Public Shareable Link
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live & Active
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Anyone with this link can fill out your form with full conditional logic and mobile optimization.
            </p>

            <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-transparent text-xs text-zinc-200 font-mono px-2 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Respondent View in New Tab
              </a>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center gap-6">
            <div className="bg-white p-3 rounded-xl shadow-lg flex-shrink-0">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Form QR Code" className="w-32 h-32" />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center text-zinc-400">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-semibold text-white">Instant Mobile QR Code</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Scan with your phone camera to experience the mobile-optimized responsive card workflow instantly!
              </p>
              <span className="text-[10px] text-zinc-500 font-mono">
                Auto-generated for hackathon evaluation
              </span>
            </div>
          </div>

          {/* Embed iframe */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-zinc-400" />
                Embed On Your Website
              </span>
              <button
                onClick={handleCopyEmbed}
                className="text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedEmbed ? 'Copied Code!' : 'Copy Snippet'}
              </button>
            </div>
            <code className="block bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-400 truncate">
              {embedCode}
            </code>
          </div>
        </div>

        {/* Right Column: Webhook Integration (FR-6) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Webhook className="w-4 h-4 text-indigo-400" />
                Custom Webhook Integrations
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">FR-6 Integration</span>
            </div>

            <p className="text-xs text-zinc-400">
              Automatically stream form submission payloads to Discord channels, Slack incoming webhooks, or custom APIs.
            </p>

            {/* Existing Webhooks List */}
            <div className="space-y-3">
              {(form.webhooks || []).length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800 text-center text-xs text-zinc-500">
                  No webhooks configured yet. Add your Discord or Slack webhook below to receive live submission alerts!
                </div>
              ) : (
                (form.webhooks || []).map((wh) => (
                  <div
                    key={wh.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{wh.name}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            wh.enabled
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {wh.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (editingId === wh.id) {
                              setEditingId(null);
                            } else {
                              setEditingId(wh.id);
                              setEditingUrl(wh.url);
                            }
                          }}
                          className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800"
                        >
                          {editingId === wh.id ? 'Cancel' : 'Edit URL'}
                        </button>
                        <button
                          onClick={() => handleToggleWebhook(wh.id)}
                          className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800"
                        >
                          {wh.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded"
                          title="Delete webhook"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingId === wh.id ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="url"
                          value={editingUrl}
                          onChange={(e) => setEditingUrl(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] font-mono text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(wh.id)}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-medium"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-zinc-400 truncate bg-zinc-900/60 px-2 py-1 rounded">
                        {wh.url}
                      </div>
                    )}

                    {/* Test Button & Result */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleTestWebhook(wh)}
                        disabled={testingWebhookId === wh.id}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3 h-3 text-indigo-400" />
                        {testingWebhookId === wh.id ? 'Testing...' : 'Test Webhook'}
                      </button>

                      {testResult && testResult.id === wh.id && (
                        <span
                          className={`text-[11px] flex items-center gap-1 font-medium ${
                            testResult.success ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {testResult.success ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5" />
                          )}
                          {testResult.msg}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Webhook Form */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 block">
                  Connect New Webhook
                </span>
                <span className="text-[10px] text-zinc-500">Quick Presets:</span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setNewWebhookName('Discord #submissions');
                    setNewWebhookUrl('https://discord.com/api/webhooks/');
                  }}
                  className="py-1 px-2 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#818CF8] text-[10px] font-semibold transition-all text-center"
                >
                  Discord
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewWebhookName('Slack #notifications');
                    setNewWebhookUrl('https://hooks.slack.com/services/');
                  }}
                  className="py-1 px-2 rounded-lg bg-[#E01E5A]/10 hover:bg-[#E01E5A]/20 border border-[#E01E5A]/30 text-[#FB7185] text-[10px] font-semibold transition-all text-center"
                >
                  Slack
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewWebhookName('Google Sheets Sync');
                    setNewWebhookUrl('https://script.google.com/macros/s/');
                  }}
                  className="py-1 px-2 rounded-lg bg-[#34A853]/10 hover:bg-[#34A853]/20 border border-[#34A853]/30 text-[#4ADE80] text-[10px] font-semibold transition-all text-center"
                >
                  Sheets API
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewWebhookName('Custom REST Endpoint');
                    setNewWebhookUrl('https://api.yourdomain.com/webhook');
                  }}
                  className="py-1 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-semibold transition-all text-center"
                >
                  REST API
                </button>
              </div>

              <input
                type="text"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="Webhook Name (e.g. Discord #submissions channel)"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/... or https://script.google.com/..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={handleAddWebhook}
                disabled={!newWebhookUrl}
                className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Webhook Endpoint
              </button>
            </div>
          </div>

          {/* FR-6 Live Webhook Payload Previewer Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Live Webhook Payload Inspector
                </span>
              </div>
              <button
                onClick={() => setShowPayloadPreview(!showPayloadPreview)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {showPayloadPreview ? <EyeOff className="w-3.5 h-3.5 text-zinc-400" /> : <Eye className="w-3.5 h-3.5 text-indigo-400" />}
                {showPayloadPreview ? 'Hide Payload' : 'Inspect Payload'}
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Real-time JSON schema generated dynamically from this form&apos;s fields and inputs.
            </p>

            {showPayloadPreview && (
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                {/* Format switcher tabs */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setPreviewFormat('json')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        previewFormat === 'json'
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      JSON / Google Sheets
                    </button>
                    <button
                      onClick={() => setPreviewFormat('discord')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        previewFormat === 'discord'
                          ? 'bg-[#5865F2] text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Discord Embed
                    </button>
                    <button
                      onClick={() => setPreviewFormat('slack')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        previewFormat === 'slack'
                          ? 'bg-[#E01E5A] text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Slack Block
                    </button>
                  </div>

                  <button
                    onClick={handleCopyPayload}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedPayload ? 'Copied JSON!' : 'Copy JSON'}
                  </button>
                </div>

                {/* Code viewer */}
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-72 leading-relaxed">
                    {previewPayloadString}
                  </pre>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-[9px] font-mono text-zinc-400">
                    application/json
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
