'use client';

import React from 'react';
import Link from 'next/link';
import { Save, Globe, Eye, GitBranch, Palette, Link as LinkIcon, Check, Sparkles } from 'lucide-react';

interface BuilderToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onPublish: () => void;
  saving: boolean;
  formStatus: string;
  publicSlug: string;
  formId: string;
  activePanel: 'properties' | 'logic' | 'theme';
  onPanelChange: (panel: 'properties' | 'logic' | 'theme') => void;
  onToggleAi?: () => void;
  isAiOpen?: boolean;
}

export default function BuilderToolbar({
  title,
  onTitleChange,
  onSave,
  onPublish,
  saving,
  formStatus,
  publicSlug,
  formId,
  activePanel,
  onPanelChange,
  onToggleAi,
  isAiOpen,
}: BuilderToolbarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/f/${publicSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: '#FFFEF9',
        borderBottom: '1px solid #B8CECF',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      {/* Left: Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: 16,
            fontWeight: 600,
            color: '#263B3B',
            width: '100%',
            maxWidth: 300,
            padding: '4px 0',
            outline: 'none',
          }}
          placeholder="Form Title"
        />
        <span className={`badge badge-${formStatus}`} style={{ flexShrink: 0 }}>
          {formStatus.charAt(0).toUpperCase() + formStatus.slice(1)}
        </span>
      </div>

      {/* Center: Panel toggles */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--accent)', borderRadius: 8, padding: 3 }}>
        {([
          { key: 'properties', label: 'Fields', icon: null },
          { key: 'logic', label: 'Logic', icon: GitBranch },
          { key: 'theme', label: 'Theme & Poster', icon: Palette },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => onPanelChange(tab.key)}
            className="btn btn-sm"
            style={{
              background: activePanel === tab.key ? 'white' : 'transparent',
              color: activePanel === tab.key ? 'var(--primary)' : '#52796F',
              boxShadow: activePanel === tab.key ? 'var(--shadow-sm)' : 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              border: 'none',
            }}
          >
            {tab.icon && <tab.icon size={13} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onToggleAi && (
          <button
            type="button"
            onClick={onToggleAi}
            className="btn btn-sm"
            style={{
              background: isAiOpen
                ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                : 'rgba(139, 92, 246, 0.15)',
              color: isAiOpen ? '#FFFFFF' : '#C084FC',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 12,
              boxShadow: isAiOpen ? '0 0 14px rgba(139, 92, 246, 0.5)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={14} color={isAiOpen ? '#FFFFFF' : '#C084FC'} />
            <span>✨ AI Assistant</span>
          </button>
        )}

        {formStatus === 'published' && (
          <button onClick={handleCopyLink} className="btn btn-ghost btn-sm" title="Copy public link">
            {copied ? <Check size={15} style={{ color: '#28a745' }} /> : <LinkIcon size={15} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        )}

        <Link href={`/dashboard/forms/${formId}/preview`} className="btn btn-ghost btn-sm">
          <Eye size={15} /> Preview
        </Link>

        <button onClick={onSave} className="btn btn-secondary btn-sm" disabled={saving}>
          {saving ? <span className="spinner" /> : <Save size={15} />}
          Save
        </button>

        <button onClick={onPublish} className="btn btn-primary btn-sm">
          <Globe size={15} /> Publish
        </button>
      </div>
    </div>
  );
}
