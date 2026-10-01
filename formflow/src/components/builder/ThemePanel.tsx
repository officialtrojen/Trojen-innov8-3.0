'use client';

import React, { useState, useRef } from 'react';
import { FormTheme } from '@/lib/types';
import {
  Palette,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Upload,
  Trash2,
  Layers,
  Layout,
  Type,
  Check,
  Square,
} from 'lucide-react';
import {
  POSTER_PRESETS,
  GRADIENT_PRESETS,
  PATTERN_PRESETS,
  BACKGROUND_IMAGE_PRESETS,
  PAGE_COLOR_PRESETS,
  isDarkColor,
} from '@/lib/theme-presets';

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
  const [activeTab, setActiveTab] = useState<'background' | 'page' | 'poster' | 'colors'>('background');
  const posterFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Handle local logo file upload (PNG/SVG/etc) as base64
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpdate({
        logoUrl: result,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle local poster file upload as base64
  const handlePosterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpdate({
        posterUrl: result,
        bannerUrl: result,
        posterStyle: theme.posterStyle || 'card-top',
        posterHeight: theme.posterHeight || 180,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle local background image upload as base64
  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpdate({
        backgroundType: 'image',
        backgroundImage: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const currentPoster = theme.posterUrl || theme.bannerUrl;

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#52796F',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Palette size={15} />
        Form Appearance & Styling
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(207,229,227,0.35)',
          borderRadius: 10,
          padding: 3,
          marginBottom: 18,
          gap: 2,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('background')}
          style={{
            padding: '8px 2px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: activeTab === 'background' ? 'white' : 'transparent',
            color: activeTab === 'background' ? '#263B3B' : '#52796F',
            boxShadow: activeTab === 'background' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
          title="Backdrop wallpaper & background"
        >
          <Layers size={12} />
          Backdrop
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('page')}
          style={{
            padding: '8px 2px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: activeTab === 'page' ? 'white' : 'transparent',
            color: activeTab === 'page' ? '#263B3B' : '#52796F',
            boxShadow: activeTab === 'page' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
            position: 'relative',
          }}
          title="Form Page / Sheet surface color"
        >
          <Square size={12} />
          Page Color
          {theme.cardBackground && theme.cardBackground !== '#FFFFFF' && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: theme.cardBackground,
                border: '1px solid rgba(0,0,0,0.25)',
                display: 'inline-block',
              }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('poster')}
          style={{
            padding: '8px 2px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: activeTab === 'poster' ? 'white' : 'transparent',
            color: activeTab === 'poster' ? '#263B3B' : '#52796F',
            boxShadow: activeTab === 'poster' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <ImageIcon size={12} />
          Poster
          {currentPoster && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#4F7C7A',
              }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          style={{
            padding: '8px 2px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: activeTab === 'colors' ? 'white' : 'transparent',
            color: activeTab === 'colors' ? '#263B3B' : '#52796F',
            boxShadow: activeTab === 'colors' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Sliders size={12} />
          Colors
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BACKGROUND CUSTOMIZATION                          */}
      {/* ======================================================== */}
      {activeTab === 'background' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Quick Form Page Surface Color Quick Access */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(207,229,227,0.3)',
              border: '1px solid rgba(184,206,207,0.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#263B3B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Square size={13} color="#4F7C7A" />
                Form Page / Sheet Color
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('page')}
                style={{
                  fontSize: 11,
                  color: '#4F7C7A',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                All Options →
              </button>
            </div>

            {/* Quick Swatches Row */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="color"
                value={theme.cardBackground || '#FFFFFF'}
                onChange={(e) => {
                  const val = e.target.value;
                  const updates: Partial<FormTheme> = { cardBackground: val };
                  if (isDarkColor(val) && (!theme.text || theme.text === '#263B3B')) {
                    updates.text = '#F8FAFC';
                  }
                  onUpdate(updates);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: '1px solid var(--input-border)',
                  cursor: 'pointer',
                  padding: 1,
                  flexShrink: 0,
                }}
                title="Custom Color Picker"
              />
              <div style={{ display: 'flex', gap: 5, flex: 1, overflowX: 'auto', paddingBottom: 2 }}>
                {[
                  { color: '#FFFFFF', label: 'Clean White' },
                  { color: '#FCFBF7', label: 'Soft Cream' },
                  { color: '#F2EFE9', label: 'Light Pebble' },
                  { color: '#F0FDF4', label: 'Ice Mint' },
                  { color: '#FFFBEB', label: 'Warm Amber' },
                  { color: '#2A2E33', label: 'Slate Gray', text: '#F8FAFC' },
                  { color: '#0F172A', label: 'Midnight', text: '#F8FAFC' },
                ].map((swatch) => {
                  const isCurrent =
                    (theme.cardBackground || '#FFFFFF').toLowerCase() === swatch.color.toLowerCase();
                  return (
                    <button
                      key={swatch.color}
                      type="button"
                      onClick={() => {
                        const updates: Partial<FormTheme> = { cardBackground: swatch.color };
                        if (swatch.text && (!theme.text || theme.text === '#263B3B')) {
                          updates.text = swatch.text;
                        } else if (!swatch.text && theme.text === '#F8FAFC') {
                          updates.text = '#263B3B';
                        }
                        onUpdate(updates);
                      }}
                      title={swatch.label}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: swatch.color,
                        border: isCurrent ? '2px solid #4F7C7A' : '1px solid rgba(0,0,0,0.15)',
                        boxShadow: isCurrent ? '0 0 0 1.5px #4F7C7A' : 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isCurrent && (
                        <Check
                          size={12}
                          color={
                            swatch.color === '#2A2E33' || swatch.color === '#0F172A'
                              ? 'white'
                              : '#4F7C7A'
                          }
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Background Type Selector */}
          <div>
            <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              Background Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { id: 'solid', label: 'Solid' },
                { id: 'gradient', label: 'Gradient' },
                { id: 'pattern', label: 'Pattern' },
                { id: 'image', label: 'Image' },
              ].map((t) => {
                const isSelected = (theme.backgroundType || 'solid') === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onUpdate({ backgroundType: t.id as FormTheme['backgroundType'] })}
                    style={{
                      padding: '7px 4px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'rgba(184,206,207,0.6)'}`,
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : '#263B3B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-options based on type */}
          {(theme.backgroundType === 'solid' || !theme.backgroundType) && (
            <div>
              <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Solid Color
              </label>
              <ColorPicker
                label="Background Canvas"
                value={theme.background || '#EAF4F4'}
                onChange={(v) => onUpdate({ background: v })}
              />

              <div style={{ marginTop: 12 }}>
                <span style={{ fontSize: 11, color: '#52796F', display: 'block', marginBottom: 6 }}>
                  Quick Palette
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['#EAF4F4', '#F8FAFC', '#FEF3C7', '#EDE9FE', '#FCE7F3', '#DCFCE7', '#1E293B'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdate({ background: hex })}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: hex,
                        border: theme.background === hex ? '2px solid #4F7C7A' : '1px solid rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                      }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {theme.backgroundType === 'gradient' && (
            <div>
              <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Curated Gradients
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {GRADIENT_PRESETS.map((g) => {
                  const isSelected = theme.backgroundGradient === g.gradient;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        onUpdate({
                          backgroundGradient: g.gradient,
                          primary: g.primary,
                        })
                      }
                      style={{
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'rgba(184,206,207,0.5)'}`,
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: 28,
                          borderRadius: 6,
                          background: g.gradient,
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#263B3B' }}>{g.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom gradient code */}
              <div style={{ marginTop: 14 }}>
                <label className="label" style={{ fontSize: 11 }}>Custom CSS Gradient</label>
                <input
                  className="input"
                  value={theme.backgroundGradient || ''}
                  onChange={(e) => onUpdate({ backgroundGradient: e.target.value })}
                  placeholder="linear-gradient(135deg, #FFF, #EEE)"
                  style={{ fontSize: 11, fontFamily: 'monospace' }}
                />
              </div>
            </div>
          )}

          {theme.backgroundType === 'pattern' && (
            <div>
              <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                Background Patterns
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {PATTERN_PRESETS.map((p) => {
                  const isSelected = (theme.backgroundPattern || 'none') === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onUpdate({ backgroundPattern: p.id })}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 10,
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'rgba(184,206,207,0.6)'}`,
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#263B3B' }}>{p.name}</span>
                      {isSelected && <Check size={14} color="#4F7C7A" />}
                    </button>
                  );
                })}
              </div>

              <ColorPicker
                label="Base Pattern Tint"
                value={theme.background || '#EAF4F4'}
                onChange={(v) => onUpdate({ background: v })}
              />

              {/* Add Background Image Option directly inside this Pattern section */}
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop: '1.5px solid rgba(184,206,207,0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label className="label" style={{ fontSize: 12, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImageIcon size={14} /> Background Image
                  </label>
                  {theme.backgroundImage && (
                    <button
                      type="button"
                      onClick={() => onUpdate({ backgroundImage: undefined })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {theme.backgroundImage ? (
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(184,206,207,0.6)', background: 'white' }}>
                    <div style={{ position: 'relative', height: 95 }}>
                      <img
                        src={theme.backgroundImage}
                        alt="Background"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => bgFileInputRef.current?.click()}
                          style={{
                            background: 'white',
                            color: '#263B3B',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '8px 12px', fontSize: 11, color: '#52796F', background: '#F8FAFC' }}>
                      ✨ The selected pattern overlays seamlessly on top of this background image
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginBottom: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '10px 14px',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        border: '1.5px solid #0F766E',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <Upload size={15} style={{ color: '#0F766E' }} />
                      <span style={{ color: '#0F172A' }}>+ Upload Background Image</span>
                    </button>

                    <div style={{ fontSize: 11, color: '#52796F', marginBottom: 6, fontWeight: 600 }}>
                      Or choose curated wallpaper:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                      {BACKGROUND_IMAGE_PRESETS.slice(0, 3).map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => onUpdate({ backgroundImage: bg.url })}
                          style={{
                            position: 'relative',
                            height: 48,
                            borderRadius: 6,
                            overflow: 'hidden',
                            border: '1px solid rgba(184,206,207,0.6)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title={bg.name}
                        >
                          <img
                            src={bg.url}
                            alt={bg.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </button>
                      ))}
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#52796F', display: 'block', marginBottom: 4 }}>
                        Or paste image URL
                      </span>
                      <input
                        className="input"
                        value={theme.backgroundImage || ''}
                        onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        style={{ fontSize: 12 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {theme.backgroundType === 'image' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="label" style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>
                  Custom Background Image
                </label>
                {theme.backgroundImage && (
                  <button
                    type="button"
                    onClick={() => onUpdate({ backgroundImage: undefined })}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#f87171',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Upload trigger */}
              <input
                ref={bgFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBgFileUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => bgFileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 14,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '10px 14px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  border: '1.5px solid #0F766E',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <Upload size={15} style={{ color: '#0F766E' }} />
                <span style={{ color: '#0F172A' }}>Upload Background Image</span>
              </button>

              {/* Curated Presets Grid */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: '#52796F', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Curated Image Presets
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {BACKGROUND_IMAGE_PRESETS.map((preset) => {
                    const isSelected = theme.backgroundImage === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onUpdate({ backgroundImage: preset.url })}
                        style={{
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'rgba(184,206,207,0.5)'}`,
                          cursor: 'pointer',
                          padding: 0,
                          background: 'white',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          style={{ width: '100%', height: 48, objectFit: 'cover' }}
                        />
                        <div style={{ padding: '4px 6px', fontSize: 10.5, fontWeight: 600, color: '#263B3B' }}>
                          {preset.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: '#52796F', display: 'block', marginBottom: 4 }}>
                  Or paste image URL
                </span>
                <input
                  className="input"
                  value={theme.backgroundImage || ''}
                  onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ fontSize: 12 }}
                />
              </div>

              {/* Dimmer / Overlay slider */}
              {theme.backgroundImage && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(207,229,227,0.25)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#263B3B' }}>Dark Dimmer Overlay</span>
                    <span style={{ fontSize: 11, color: '#52796F', fontWeight: 600 }}>{theme.backgroundOverlay ?? 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={theme.backgroundOverlay ?? 0}
                    onChange={(e) => onUpdate({ backgroundOverlay: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ fontSize: 10, color: '#52796F', marginTop: 4 }}>
                    Darkens background photo so form questions and fields pop with high contrast.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: FORM PAGE / SHEET COLOR & STYLING                  */}
      {/* ======================================================== */}
      {activeTab === 'page' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Main Color Picker */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="label" style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>
                Form Page Surface Color
              </label>
              {theme.cardBackground && theme.cardBackground !== '#FFFFFF' && (
                <button
                  type="button"
                  onClick={() => onUpdate({ cardBackground: '#FFFFFF', text: '#263B3B' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#52796F',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Reset to White
                </button>
              )}
            </div>
            <ColorPicker
              label="Form Sheet Background Color"
              value={theme.cardBackground || '#FFFFFF'}
              onChange={(v) => {
                const updates: Partial<FormTheme> = { cardBackground: v };
                if (isDarkColor(v) && (!theme.text || theme.text === '#263B3B')) {
                  updates.text = '#F8FAFC';
                }
                onUpdate(updates);
              }}
            />
          </div>

          {/* Curated Page Color Presets */}
          <div>
            <label
              className="label"
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={13} color="#4F7C7A" />
              Curated Page Color Presets
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PAGE_COLOR_PRESETS.map((preset) => {
                const isSelected =
                  (theme.cardBackground || '#FFFFFF').toLowerCase() === preset.color.toLowerCase();
                const isPresetDark = isDarkColor(preset.color);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      const updates: Partial<FormTheme> = { cardBackground: preset.color };
                      if (preset.textColor) {
                        updates.text = preset.textColor;
                      }
                      onUpdate(updates);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: isSelected
                        ? '2px solid #4F7C7A'
                        : '1px solid rgba(184,206,207,0.6)',
                      background: preset.color,
                      color: preset.textColor || (isPresetDark ? '#F8FAFC' : '#263B3B'),
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: isSelected
                        ? '0 4px 12px rgba(79, 124, 122, 0.25)'
                        : '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{preset.name}</span>
                      {isSelected && <Check size={13} color={isPresetDark ? '#38BDF8' : '#4F7C7A'} />}
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.8, lineHeight: 1.3 }}>
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Page Opacity & Glassmorphism */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="label" style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>
                Page Opacity & Glassmorphism
              </label>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#52796F' }}>
                {theme.cardOpacity ?? 100}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={theme.cardOpacity ?? 100}
              onChange={(e) => onUpdate({ cardOpacity: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#4F7C7A', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
              <span>Frosted Glass (50%)</span>
              <span>Subtle Tint (85%)</span>
              <span>Solid Opaque (100%)</span>
            </div>
            {(theme.cardOpacity ?? 100) < 100 && (
              <div
                style={{
                  marginTop: 8,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: 'rgba(79, 124, 122, 0.1)',
                  fontSize: 11,
                  color: '#4F7C7A',
                  lineHeight: 1.4,
                }}
              >
                ✨ Glassmorphism enabled! Canvas background imagery and patterns subtly glow through the form sheet.
              </div>
            )}
          </div>

          {/* Corner Curvature */}
          <div>
            <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              Page Corner Radius
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { radius: 8, label: 'Sharp' },
                { radius: 14, label: 'Medium' },
                { radius: 20, label: 'Rounded' },
                { radius: 28, label: 'Pill' },
              ].map((r) => {
                const isSelected = (theme.cardBorderRadius ?? 20) === r.radius;
                return (
                  <button
                    key={r.radius}
                    type="button"
                    onClick={() => onUpdate({ cardBorderRadius: r.radius })}
                    style={{
                      padding: '7px 4px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'rgba(184,206,207,0.6)'}`,
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : '#263B3B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Page Shadow / Elevation */}
          <div>
            <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              Page Shadow & Elevation
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { id: 'none', label: 'Flat' },
                { id: 'subtle', label: 'Subtle' },
                { id: 'elevated', label: 'Elevated' },
                { id: 'glow', label: 'Glow' },
              ].map((s) => {
                const isSelected = (theme.cardShadow ?? 'elevated') === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onUpdate({ cardShadow: s.id as FormTheme['cardShadow'] })}
                    style={{
                      padding: '7px 4px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'rgba(184,206,207,0.6)'}`,
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : '#263B3B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: POSTER IN FORM                                    */}
      {/* ======================================================== */}
      {activeTab === 'poster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Logo (PNG) in Poster Area */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(207,229,227,0.3)',
              border: '1.5px dashed rgba(79,124,122,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="label" style={{ fontSize: 12, fontWeight: 700, color: '#263B3B', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                Brand Logo (PNG)
              </label>
              {theme.logoUrl && (
                <button
                  type="button"
                  onClick={() => onUpdate({ logoUrl: undefined })}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#f87171',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Trash2 size={11} /> Remove Logo
                </button>
              )}
            </div>

            <p style={{ fontSize: 11, color: '#52796F', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              Appears in dedicated space on the left side of the poster. Transparent PNGs recommended.
            </p>

            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleLogoFileUpload}
              style={{ display: 'none' }}
            />

            {theme.logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 10,
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(184,206,207,0.8)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={theme.logoUrl}
                    alt="Logo preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: '1px solid #4F7C7A',
                      background: 'white',
                      color: '#4F7C7A',
                      cursor: 'pointer',
                    }}
                  >
                    Change Logo PNG
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '8px 12px',
                  background: '#FFFFFF',
                  color: '#263B3B',
                  border: '1.5px solid #4F7C7A',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} style={{ color: '#4F7C7A' }} />
                Upload Logo PNG
              </button>
            )}

            <div style={{ marginTop: 8 }}>
              <input
                className="input"
                value={theme.logoUrl || ''}
                onChange={(e) => onUpdate({ logoUrl: e.target.value })}
                placeholder="Or paste Logo PNG URL..."
                style={{ fontSize: 11, padding: '5px 8px' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label className="label" style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>
                Form Poster / Banner
              </label>
              {currentPoster && (
                <button
                  type="button"
                  onClick={() => onUpdate({ posterUrl: undefined, bannerUrl: undefined })}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#f87171',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Trash2 size={12} /> Remove Poster
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={posterFileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePosterFileUpload}
              style={{ display: 'none' }}
            />

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => posterFileInputRef.current?.click()}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              <Upload size={15} />
              Upload Poster Image
            </button>

            {/* Poster URL fallback */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: '#52796F', display: 'block', marginBottom: 4 }}>
                Or Image URL
              </span>
              <input
                className="input"
                value={currentPoster || ''}
                onChange={(e) => onUpdate({ posterUrl: e.target.value, bannerUrl: e.target.value })}
                placeholder="https://example.com/poster.jpg"
                style={{ fontSize: 12 }}
              />
            </div>

            {/* Current Poster Preview */}
            {currentPoster && (
              <div
                style={{
                  position: 'relative',
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 16,
                  border: '1px solid rgba(184,206,207,0.5)',
                }}
              >
                <img
                  src={currentPoster}
                  alt="Poster preview"
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `rgba(0,0,0, ${(theme.posterOverlay || 20) / 100})`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 10,
                    color: 'white',
                  }}
                >
                  {theme.posterTitle && (
                    <div style={{ fontWeight: 700, fontSize: 13, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                      {theme.posterTitle}
                    </div>
                  )}
                  {theme.posterSubtitle && (
                    <div style={{ fontSize: 11, opacity: 0.9, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                      {theme.posterSubtitle}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Poster Style Selector */}
            {currentPoster && (
              <div style={{ marginBottom: 14 }}>
                <label className="label" style={{ fontSize: 11, fontWeight: 600 }}>Poster Position & Style</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    { id: 'card-top', label: 'Top of Card' },
                    { id: 'banner', label: 'Full Header' },
                    { id: 'floating', label: 'Floating Poster' },
                    { id: 'background', label: 'Cover Blur' },
                  ].map((s) => {
                    const isSelected = (theme.posterStyle || 'card-top') === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onUpdate({ posterStyle: s.id as FormTheme['posterStyle'] })}
                        style={{
                          padding: '6px 8px',
                          fontSize: 11,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: `1.5px solid ${isSelected ? 'var(--primary)' : 'rgba(184,206,207,0.6)'}`,
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          color: isSelected ? 'var(--primary)' : '#263B3B',
                          cursor: 'pointer',
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Poster Height Slider */}
            {currentPoster && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#52796F', marginBottom: 4 }}>
                  <span>Poster Height</span>
                  <span>{theme.posterHeight || 180}px</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="320"
                  step="10"
                  value={theme.posterHeight || 180}
                  onChange={(e) => onUpdate({ posterHeight: Number(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#4F7C7A' }}
                />
              </div>
            )}

            {/* Poster Text Overlay */}
            {currentPoster && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <div>
                  <label className="label" style={{ fontSize: 11 }}>Poster Title Overlay (Optional)</label>
                  <input
                    className="input"
                    value={theme.posterTitle || ''}
                    onChange={(e) => onUpdate({ posterTitle: e.target.value })}
                    placeholder="e.g. Innov8 Hackathon"
                    style={{ fontSize: 12 }}
                  />
                </div>
                <div>
                  <label className="label" style={{ fontSize: 11 }}>Poster Subtitle / Tagline</label>
                  <input
                    className="input"
                    value={theme.posterSubtitle || ''}
                    onChange={(e) => onUpdate({ posterSubtitle: e.target.value })}
                    placeholder="e.g. Official Registration"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>
            )}

            {/* Curated Aesthetic Poster Presets */}
            <div>
              <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} color="#4F7C7A" />
                Or Pick a Curated Preset
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {POSTER_PRESETS.map((p) => {
                  const isCurrent = currentPoster === p.url;
                  return (
                    <div
                      key={p.id}
                      onClick={() =>
                        onUpdate({
                          posterUrl: p.url,
                          bannerUrl: p.url,
                          posterTitle: p.suggestedTitle,
                          posterSubtitle: p.suggestedSubtitle,
                          posterStyle: theme.posterStyle || 'card-top',
                          posterHeight: theme.posterHeight || 180,
                        })
                      }
                      style={{
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: `2px solid ${isCurrent ? '#4F7C7A' : 'rgba(184,206,207,0.4)'}`,
                        position: 'relative',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        style={{ width: '100%', height: 64, objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          padding: '4px 6px',
                          background: 'white',
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#263B3B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COLORS & TYPOGRAPHY                               */}
      {/* ======================================================== */}
      {activeTab === 'colors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Colors */}
          <div>
            <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Theme Accent Colors</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ColorPicker
                label="Form Page Surface Color"
                value={theme.cardBackground || '#FFFFFF'}
                onChange={(v) => {
                  const updates: Partial<FormTheme> = { cardBackground: v };
                  if (isDarkColor(v) && (!theme.text || theme.text === '#263B3B')) {
                    updates.text = '#F8FAFC';
                  }
                  onUpdate(updates);
                }}
              />
              <ColorPicker label="Primary Brand Color" value={theme.primary} onChange={(v) => onUpdate({ primary: v })} />
              <ColorPicker label="Secondary Accent" value={theme.secondary} onChange={(v) => onUpdate({ secondary: v })} />
              <ColorPicker label="Text Color" value={theme.text} onChange={(v) => onUpdate({ text: v })} />
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Type size={13} />
              Typography
            </label>

            <div style={{ marginBottom: 10 }}>
              <label className="label" style={{ fontSize: 11 }}>Font Family</label>
              <select
                className="select"
                value={theme.fontFamily}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                style={{ fontSize: 12 }}
              >
                {fontOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" style={{ fontSize: 11 }}>Text Scale</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {sizeOptions.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => onUpdate({ fontSize: s.value })}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: theme.fontSize === s.value ? 'var(--primary)' : 'transparent',
                      color: theme.fontSize === s.value ? 'white' : 'var(--text-main)',
                      border: `1px solid ${theme.fontSize === s.value ? 'var(--primary)' : 'var(--input-border)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Layout */}
          <div>
            <label className="label" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layout size={13} />
              Form Experience Layout
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['single-page', 'conversational'] as const).map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => onUpdate({ layout })}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    background: theme.layout === layout ? 'var(--primary)' : 'transparent',
                    color: theme.layout === layout ? 'white' : 'var(--text-main)',
                    border: `1.5px solid ${theme.layout === layout ? 'var(--primary)' : 'var(--input-border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {layout === 'single-page' ? '📄 Single Page' : '💬 Conversational'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
        <div style={{ fontSize: 11, color: '#52796F', marginBottom: 2 }}>{label}</div>
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
