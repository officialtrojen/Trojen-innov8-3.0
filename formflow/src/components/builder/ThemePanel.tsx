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
} from 'lucide-react';
import {
  POSTER_PRESETS,
  GRADIENT_PRESETS,
  PATTERN_PRESETS,
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
  const [activeTab, setActiveTab] = useState<'background' | 'poster' | 'colors'>('background');
  const posterFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

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
    <div
      style={{
        padding: '20px 18px',
        background: '#FFFEF9',
        color: '#263B3B',
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#4F7C7A',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #B8CECF',
          paddingBottom: 10,
        }}
      >
        <Palette size={15} color="#4F7C7A" />
        Form Appearance & Styling
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#EAF4F4',
          border: '1px solid #B8CECF',
          borderRadius: 10,
          padding: 3,
          marginBottom: 20,
          gap: 2,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('background')}
          style={{
            flex: 1,
            padding: '8px 4px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: activeTab === 'background' ? '#4F7C7A' : 'transparent',
            color: activeTab === 'background' ? '#FFFEF9' : '#365F5D',
            boxShadow: activeTab === 'background' ? '0 2px 5px rgba(38, 59, 59, 0.2)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={13} />
          Background
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('poster')}
          style={{
            flex: 1,
            padding: '8px 4px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: activeTab === 'poster' ? '#4F7C7A' : 'transparent',
            color: activeTab === 'poster' ? '#FFFEF9' : '#365F5D',
            boxShadow: activeTab === 'poster' ? '0 2px 5px rgba(38, 59, 59, 0.2)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <ImageIcon size={13} />
          Poster
          {currentPoster && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: activeTab === 'poster' ? '#CFE5E3' : '#4F7C7A',
              }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          style={{
            flex: 1,
            padding: '8px 4px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: activeTab === 'colors' ? '#4F7C7A' : 'transparent',
            color: activeTab === 'colors' ? '#FFFEF9' : '#365F5D',
            boxShadow: activeTab === 'colors' ? '0 2px 5px rgba(38, 59, 59, 0.2)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Sliders size={13} />
          Colors & Text
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BACKGROUND CUSTOMIZATION                          */}
      {/* ======================================================== */}
      {activeTab === 'background' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Background Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 8 }}>
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
                      padding: '8px 4px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? '#4F7C7A' : '#B8CECF'}`,
                      background: isSelected ? '#CFE5E3' : '#FFFEF9',
                      color: isSelected ? '#263B3B' : '#365F5D',
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 8 }}>
                Solid Color
              </label>
              <ColorPicker
                label="Background Canvas"
                value={theme.background || '#EAF4F4'}
                onChange={(v) => onUpdate({ background: v })}
              />

              <div style={{ marginTop: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#365F5D', display: 'block', marginBottom: 6 }}>
                  Curated Brand Palette
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['#EAF4F4', '#FFFEF9', '#4F7C7A', '#B8CECF', '#263B3B', '#365F5D', '#CFE5E3'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onUpdate({ background: hex })}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: hex,
                        border: theme.background === hex ? '2.5px solid #4F7C7A' : '1.5px solid #B8CECF',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(38, 59, 59, 0.15)',
                        transition: 'transform 0.1s ease',
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 8 }}>
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
                        border: `1.5px solid ${isSelected ? '#4F7C7A' : '#B8CECF'}`,
                        background: isSelected ? '#CFE5E3' : '#FFFEF9',
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
                          border: '1px solid #B8CECF',
                        }}
                      />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#263B3B' }}>{g.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom gradient code */}
              <div style={{ marginTop: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#365F5D', marginBottom: 4 }}>
                  Custom CSS Gradient
                </label>
                <input
                  value={theme.backgroundGradient || ''}
                  onChange={(e) => onUpdate({ backgroundGradient: e.target.value })}
                  placeholder="linear-gradient(135deg, #EAF4F4, #CFE5E3)"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1.5px solid #B8CECF',
                    background: '#FFFEF9',
                    color: '#263B3B',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
                />
              </div>
            </div>
          )}

          {theme.backgroundType === 'pattern' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 8 }}>
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
                        border: `1.5px solid ${isSelected ? '#4F7C7A' : '#B8CECF'}`,
                        background: isSelected ? '#CFE5E3' : '#FFFEF9',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#263B3B' }}>{p.name}</span>
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
            </div>
          )}

          {theme.backgroundType === 'image' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 8 }}>
                Custom Background Image
              </label>

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
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #4F7C7A',
                  background: '#EAF4F4',
                  color: '#4F7C7A',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 10,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#CFE5E3'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#EAF4F4'; }}
              >
                <Upload size={14} />
                Upload Background Image
              </button>

              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#365F5D', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Or paste image URL
                </span>
                <input
                  value={theme.backgroundImage || ''}
                  onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #B8CECF',
                    background: '#FFFEF9',
                    color: '#263B3B',
                    fontSize: 12,
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
                />
              </div>

              {theme.backgroundImage && (
                <div style={{ position: 'relative', marginTop: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid #B8CECF' }}>
                  <img
                    src={theme.backgroundImage}
                    alt="Background preview"
                    style={{ width: '100%', height: 90, objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => onUpdate({ backgroundImage: '' })}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      background: 'rgba(38, 59, 59, 0.75)',
                      color: '#FFFEF9',
                      border: 'none',
                      borderRadius: 6,
                      padding: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: POSTER IN FORM                                    */}
      {/* ======================================================== */}
      {activeTab === 'poster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#263B3B', margin: 0 }}>
                Form Poster / Banner
              </label>
              {currentPoster && (
                <button
                  type="button"
                  onClick={() => onUpdate({ posterUrl: undefined, bannerUrl: undefined })}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#e74c3c',
                    fontSize: 11,
                    fontWeight: 700,
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
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 12,
                padding: '10px 14px',
                borderRadius: 8,
                background: '#4F7C7A',
                color: '#FFFEF9',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 124, 122, 0.25)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#365F5D'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#4F7C7A'; }}
            >
              <Upload size={15} />
              Upload Poster Image
            </button>

            {/* Poster URL fallback */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: '#365F5D', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                Or Image URL
              </span>
              <input
                value={currentPoster || ''}
                onChange={(e) => onUpdate({ posterUrl: e.target.value, bannerUrl: e.target.value })}
                placeholder="https://example.com/poster.jpg"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #B8CECF',
                  background: '#FFFEF9',
                  color: '#263B3B',
                  fontSize: 12,
                  outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
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
                  border: '1.5px solid #B8CECF',
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
                    background: `rgba(38, 59, 59, ${(theme.posterOverlay || 25) / 100})`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 10,
                    color: '#FFFEF9',
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
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#365F5D', marginBottom: 6 }}>
                  Poster Position & Style
                </label>
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
                          padding: '7px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 6,
                          border: `1.5px solid ${isSelected ? '#4F7C7A' : '#B8CECF'}`,
                          background: isSelected ? '#CFE5E3' : '#FFFEF9',
                          color: isSelected ? '#263B3B' : '#365F5D',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#365F5D', fontWeight: 600, marginBottom: 4 }}>
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
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#365F5D', marginBottom: 4 }}>
                    Poster Title Overlay (Optional)
                  </label>
                  <input
                    value={theme.posterTitle || ''}
                    onChange={(e) => onUpdate({ posterTitle: e.target.value })}
                    placeholder="e.g. Innov8 Hackathon"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #B8CECF',
                      background: '#FFFEF9',
                      color: '#263B3B',
                      fontSize: 12,
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#365F5D', marginBottom: 4 }}>
                    Poster Subtitle / Tagline
                  </label>
                  <input
                    value={theme.posterSubtitle || ''}
                    onChange={(e) => onUpdate({ posterSubtitle: e.target.value })}
                    placeholder="e.g. Official Registration"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #B8CECF',
                      background: '#FFFEF9',
                      color: '#263B3B',
                      fontSize: 12,
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
                  />
                </div>
              </div>
            )}

            {/* Curated Aesthetic Poster Presets */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
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
                        border: `2px solid ${isCurrent ? '#4F7C7A' : '#B8CECF'}`,
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
                          background: '#FFFEF9',
                          fontSize: 10,
                          fontWeight: 700,
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
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 10 }}>
              Theme Accent Colors
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ColorPicker label="Primary Brand Color" value={theme.primary} onChange={(v) => onUpdate({ primary: v })} />
              <ColorPicker label="Secondary Accent" value={theme.secondary} onChange={(v) => onUpdate({ secondary: v })} />
              <ColorPicker label="Text Color" value={theme.text} onChange={(v) => onUpdate({ text: v })} />
            </div>
          </div>

          {/* Typography */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Type size={13} color="#4F7C7A" />
              Typography
            </label>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#365F5D', marginBottom: 4 }}>
                Font Family
              </label>
              <select
                value={theme.fontFamily}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1.5px solid #B8CECF',
                  background: '#FFFEF9',
                  color: '#263B3B',
                  fontSize: 12,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {fontOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#365F5D', marginBottom: 4 }}>
                Text Scale
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {sizeOptions.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => onUpdate({ fontSize: s.value })}
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: theme.fontSize === s.value ? '#4F7C7A' : '#FFFEF9',
                      color: theme.fontSize === s.value ? '#FFFEF9' : '#263B3B',
                      border: `1.5px solid ${theme.fontSize === s.value ? '#4F7C7A' : '#B8CECF'}`,
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
            <label style={{ fontSize: 12, fontWeight: 700, color: '#263B3B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layout size={13} color="#4F7C7A" />
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
                    padding: '9px 6px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    background: theme.layout === layout ? '#4F7C7A' : '#FFFEF9',
                    color: theme.layout === layout ? '#FFFEF9' : '#263B3B',
                    border: `1.5px solid ${theme.layout === layout ? '#4F7C7A' : '#B8CECF'}`,
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
          width: 34,
          height: 34,
          borderRadius: 8,
          border: '1.5px solid #B8CECF',
          cursor: 'pointer',
          padding: 2,
          background: '#FFFEF9',
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#365F5D', marginBottom: 2 }}>{label}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1.5px solid #B8CECF',
            background: '#FFFEF9',
            color: '#263B3B',
            fontFamily: 'monospace',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#4F7C7A'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#B8CECF'; }}
        />
      </div>
    </div>
  );
}
