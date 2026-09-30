'use client';

import React from 'react';
import Link from 'next/link';
import { Save, Globe, Eye, GitBranch, Palette, Link as LinkIcon, Check } from 'lucide-react';

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
            border: '1px solid transparent',
            borderRadius: 6,
            background: 'transparent',
            fontSize: 16,
            fontWeight: 700,
            color: '#263B3B',
            width: '100%',
            maxWidth: 320,
            padding: '4px 8px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#B8CECF';
            e.currentTarget.style.background = '#EAF4F4';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.background = 'transparent';
          }}
          placeholder="Form Title"
        />
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: '#CFE5E3',
            color: '#263B3B',
            border: '1px solid #B8CECF',
            flexShrink: 0,
          }}
        >
          {formStatus.charAt(0).toUpperCase() + formStatus.slice(1)}
        </span>
      </div>

      {/* Center: Panel toggles */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: '#EAF4F4',
          borderRadius: 8,
          padding: 3,
          border: '1px solid #B8CECF',
        }}
      >
        {([
          { key: 'properties', label: 'Questions', icon: null },
          { key: 'logic', label: 'Logic', icon: GitBranch },
          { key: 'theme', label: 'Background & Poster', icon: Palette },
        ] as const).map((tab) => {
          const isSelected = activePanel === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onPanelChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: isSelected ? '#4F7C7A' : 'transparent',
                color: isSelected ? '#FFFEF9' : '#365F5D',
                boxShadow: isSelected ? '0 1px 3px rgba(38, 59, 59, 0.2)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon && <tab.icon size={13} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {formStatus === 'published' && (
          <button
            onClick={handleCopyLink}
            type="button"
            title="Copy public link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 6,
              background: 'transparent',
              color: '#365F5D',
              border: '1px solid #B8CECF',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={14} style={{ color: '#4F7C7A' }} /> : <LinkIcon size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        )}

        <Link
          href={`/dashboard/forms/${formId}/preview`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 6,
            background: 'transparent',
            color: '#365F5D',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <Eye size={14} /> Preview
        </Link>

        <button
          onClick={onSave}
          disabled={saving}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 6,
            background: '#EAF4F4',
            color: '#263B3B',
            border: '1.5px solid #B8CECF',
            fontSize: 12,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <span className="spinner" /> : <Save size={14} />}
          Save
        </button>

        <button
          onClick={onPublish}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            borderRadius: 6,
            background: '#4F7C7A',
            color: '#FFFEF9',
            border: 'none',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(79, 124, 122, 0.3)',
          }}
        >
          <Globe size={14} /> Publish
        </button>
      </div>
    </div>
  );
}
