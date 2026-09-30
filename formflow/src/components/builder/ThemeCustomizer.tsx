'use client';

import React from 'react';
import { FormTheme, LayoutMode } from '@/types/form';
import { Palette, Sparkles, Image, Check, LayoutTemplate, Layers } from 'lucide-react';

interface ThemeCustomizerProps {
  theme: FormTheme;
  onUpdateTheme: (theme: FormTheme) => void;
}

const COLOR_PRESETS = [
  { name: 'Indigo Aura', primary: '#6366f1', accent: '#818cf8', bg: '#0b0f19', card: '#151d30' },
  { name: 'Emerald Matrix', primary: '#10b981', accent: '#34d399', bg: '#091510', card: '#11221b' },
  { name: 'Cyberpunk Rose', primary: '#ec4899', accent: '#f472b6', bg: '#180b14', card: '#251320' },
  { name: 'Solar Amber', primary: '#f59e0b', accent: '#fbbf24', bg: '#171109', card: '#251c10' },
  { name: 'Deep Obsidian', primary: '#3b82f6', accent: '#60a5fa', bg: '#08090d', card: '#12141c' },
  { name: 'Royal Violet', primary: '#8b5cf6', accent: '#a78bfa', bg: '#110c1c', card: '#1d152e' },
];

const FONTS = [
  { name: 'Outfit', desc: 'Modern & Geometric' },
  { name: 'Inter', desc: 'Clean & Ultra-legible' },
  { name: 'Plus Jakarta Sans', desc: 'Contemporary Tech' },
  { name: 'JetBrains Mono', desc: 'Developer & Code' },
  { name: 'Playfair Display', desc: 'Editorial Serif' },
];

const BANNER_PRESETS = [
  {
    name: 'Hackathon Cyber',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Gradient Fluid',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tech Campus',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Minimal Dark Mesh',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  theme,
  onUpdateTheme,
}) => {
  return (
    <div className="flex-1 h-full overflow-y-auto p-8 max-w-5xl mx-auto text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Form Customizer & Theming</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Customize typography, color palettes, banner backgrounds, and experience layout mode.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Layout Mode (FR-3 Requirement: Single-page vs Conversational card) */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Layout Mode (Respondent Experience)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateTheme({ ...theme, layoutMode: 'conversational' })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  theme.layoutMode === 'conversational'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Conversational Card</span>
                  {theme.layoutMode === 'conversational' && (
                    <Check className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Typeform-style single question per card with smooth auto-scroll & progress bar.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onUpdateTheme({ ...theme, layoutMode: 'single_page' })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  theme.layoutMode === 'single_page'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/50'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Single-Page Form</span>
                  {theme.layoutMode === 'single_page' && (
                    <Check className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Traditional all-in-one scrollable form layout with submit button at the bottom.
                </p>
              </button>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Color Palette Preset
              </label>
              <span className="text-[11px] text-zinc-500">Harmonious dark themes</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {COLOR_PRESETS.map((p) => {
                const isSelected = theme.primaryColor === p.primary && theme.backgroundColor === p.bg;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({
                        ...theme,
                        primaryColor: p.primary,
                        accentColor: p.accent,
                        backgroundColor: p.bg,
                        cardBackground: p.card,
                      })
                    }
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-zinc-800/80 ring-1 ring-indigo-500/50'
                        : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: p.primary }}
                      />
                      <span className="text-xs font-medium text-zinc-200">{p.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Overrides */}
            <div className="pt-3 border-t border-zinc-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Primary Color</label>
                <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-700">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => onUpdateTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="font-mono text-xs text-zinc-300">{theme.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Background Base</label>
                <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-700">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => onUpdateTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="font-mono text-xs text-zinc-300">{theme.backgroundColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Font Typography
            </label>
            <div className="grid grid-cols-1 gap-2">
              {FONTS.map((font) => (
                <button
                  key={font.name}
                  onClick={() => onUpdateTheme({ ...theme, fontFamily: font.name })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    theme.fontFamily === font.name
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{font.name}</div>
                    <div className="text-[10px] text-zinc-500">{font.desc}</div>
                  </div>
                  {theme.fontFamily === font.name && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Banner & Preview */}
        <div className="space-y-6">
          {/* Banner Image Customizer */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Header Banner Image
              </label>
              {theme.bannerImage && (
                <button
                  onClick={() => onUpdateTheme({ ...theme, bannerImage: '' })}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Remove banner
                </button>
              )}
            </div>

            <input
              type="text"
              value={theme.bannerImage || ''}
              onChange={(e) => onUpdateTheme({ ...theme, bannerImage: e.target.value })}
              placeholder="Paste custom image URL..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="grid grid-cols-2 gap-2 pt-2">
              {BANNER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onUpdateTheme({ ...theme, bannerImage: preset.url })}
                  className="group relative h-20 rounded-xl overflow-hidden border border-zinc-800 hover:border-indigo-500 transition-all text-left"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 p-2 flex items-end">
                    <span className="text-[10px] font-semibold text-white truncate">
                      {preset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Live Theme Preview
            </label>
            <div
              className="rounded-2xl p-6 border shadow-2xl transition-all overflow-hidden"
              style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                fontFamily: theme.fontFamily,
              }}
            >
              {theme.bannerImage && (
                <div className="h-28 -mx-6 -mt-6 mb-4 overflow-hidden relative">
                  <img
                    src={theme.bannerImage}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              )}

              <div
                className="p-4 rounded-xl border backdrop-blur-md"
                style={{
                  backgroundColor: theme.cardBackground,
                  borderColor: `${theme.primaryColor}33`,
                }}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: theme.accentColor }}>
                  {theme.layoutMode === 'conversational' ? 'Typeform Card Mode' : 'Standard Mode'}
                </div>
                <h4 className="text-base font-bold mb-2">How satisfied are you with this workshop?</h4>
                <p className="text-xs text-zinc-400 mb-4">Sample question preview using current typography and colors.</p>
                <button
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-lg transition-transform active:scale-95"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
