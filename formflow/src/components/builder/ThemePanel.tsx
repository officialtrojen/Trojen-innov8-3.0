'use client';

import React from 'react';
import { FormTheme } from '@/lib/types';
import { Palette } from 'lucide-react';

interface ThemePanelProps {
  theme: FormTheme;
  onUpdate: (updates: Partial<FormTheme>) => void;
}

const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Outfit', 'Space Grotesk'];
const sizeOptions: { value: 'small' | 'medium' | 'large'; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export default function ThemePanel({ theme, onUpdate }: ThemePanelProps) {
  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#52796F',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Palette size={14} />
        Theme & Customization
      </div>

      {/* Colors */}
      <div style={{ marginBottom: 20 }}>
        <label className="label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Colors</label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ColorPicker label="Background" value={theme.background} onChange={(v) => onUpdate({ background: v })} />
          <ColorPicker label="Primary" value={theme.primary} onChange={(v) => onUpdate({ primary: v })} />
          <ColorPicker label="Secondary" value={theme.secondary} onChange={(v) => onUpdate({ secondary: v })} />
          <ColorPicker label="Text" value={theme.text} onChange={(v) => onUpdate({ text: v })} />
        </div>
      </div>

      {/* Typography */}
      <div style={{ marginBottom: 20 }}>
        <label className="label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Typography</label>

        <div style={{ marginBottom: 10 }}>
          <label className="label">Font Family</label>
          <select
            className="select"
            value={theme.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          >
            {fontOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Font Size</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {sizeOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => onUpdate({ fontSize: s.value })}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: theme.fontSize === s.value ? 'var(--primary)' : 'transparent',
                  color: theme.fontSize === s.value ? 'white' : 'var(--text-main)',
                  border: `1px solid ${theme.fontSize === s.value ? 'var(--primary)' : 'var(--input-border)'}`,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div style={{ marginBottom: 20 }}>
        <label className="label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Layout</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['single-page', 'conversational'] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => onUpdate({ layout })}
              className="btn btn-sm"
              style={{
                flex: 1,
                background: theme.layout === layout ? 'var(--primary)' : 'transparent',
                color: theme.layout === layout ? 'white' : 'var(--text-main)',
                border: `1px solid ${theme.layout === layout ? 'var(--primary)' : 'var(--input-border)'}`,
                fontSize: 12,
              }}
            >
              {layout === 'single-page' ? 'Single Page' : 'Conversational'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick presets */}
      <div>
        <label className="label" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Quick Presets</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <PresetButton
            label="FormFlow"
            colors={['#EAF4F4', '#4F7C7A', '#CFE5E3', '#263B3B']}
            onClick={() => onUpdate({ background: '#EAF4F4', primary: '#4F7C7A', secondary: '#CFE5E3', text: '#263B3B' })}
          />
          <PresetButton
            label="Sage"
            colors={['#E8F0E6', '#52796F', '#C8DDD0', '#263B3B']}
            onClick={() => onUpdate({ background: '#E8F0E6', primary: '#52796F', secondary: '#C8DDD0', text: '#263B3B' })}
          />
          <PresetButton
            label="Ocean"
            colors={['#E8F4FD', '#2E86AB', '#D4ECFC', '#1A3A4A']}
            onClick={() => onUpdate({ background: '#E8F4FD', primary: '#2E86AB', secondary: '#D4ECFC', text: '#1A3A4A' })}
          />
          <PresetButton
            label="Warm"
            colors={['#FFF5EE', '#C77B5A', '#FFE8D6', '#3D2B1F']}
            onClick={() => onUpdate({ background: '#FFF5EE', primary: '#C77B5A', secondary: '#FFE8D6', text: '#3D2B1F' })}
          />
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: '1px solid var(--input-border)',
          cursor: 'pointer',
          padding: 2,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#52796F', marginBottom: 2 }}>{label}</div>
        <input
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontSize: 12, padding: '4px 8px' }}
        />
      </div>
    </div>
  );
}

function PresetButton({ label, colors, onClick }: { label: string; colors: string[]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid rgba(184,206,207,0.5)',
        background: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontSize: 12,
        fontWeight: 500,
        color: '#263B3B',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', gap: 2 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
        ))}
      </div>
      {label}
    </button>
  );
}
