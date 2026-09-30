'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Save, Globe, Eye, GitBranch, Palette, Link as LinkIcon, Check, Sparkles } from 'lucide-react';

interface BuilderToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onPublish: () => void | Promise<void>;
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handlePublishClick = async () => {
    setPublishing(true);
    try {
      await onPublish();
      // Open share modal immediately upon publishing so creator gets the public submission URL
      setIsShareModalOpen(true);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: '#FCFBF7',
          borderBottom: '1px solid rgba(122, 139, 153, 0.25)',
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
              color: '#2A2E33',
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
        <div style={{ display: 'flex', gap: 4, background: '#F2EFE9', borderRadius: 8, padding: 3 }}>
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
                background: activePanel === tab.key ? '#FFFFFF' : 'transparent',
                color: activePanel === tab.key ? '#2A2E33' : '#7A8B99',
                boxShadow: activePanel === tab.key ? '0 1px 3px rgba(42, 46, 51, 0.1)' : 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tab.icon && <tab.icon size={13} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {formStatus === 'published' && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="btn btn-ghost btn-sm"
              title="Get Shareable Link"
              style={{
                color: '#2A2E33',
                background: '#F2EFE9',
                border: '1px solid rgba(122, 139, 153, 0.25)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Share2 size={14} style={{ color: '#2A2E33' }} />
              Share Link
            </button>
          )}

          <Link
            href={`/dashboard/forms/${formId}/preview`}
            className="btn btn-ghost btn-sm"
            style={{ color: '#2A2E33', fontWeight: 600 }}
          >
            <Eye size={15} /> Preview
          </Link>

          <button
            onClick={onSave}
            className="btn btn-secondary btn-sm"
            disabled={saving}
            style={{
              background: '#FFFFFF',
              color: '#2A2E33',
              border: '1px solid #D8D2C7',
              fontWeight: 600,
            }}
          >
            {saving ? <span className="spinner" /> : <Save size={15} />}
            Save
          </button>
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
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        formTitle={title}
        publicSlug={publicSlug}
        formId={formId}
      />
    </>
  );
}
