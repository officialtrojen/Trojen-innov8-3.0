'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  GitBranch,
  Palette,
  Share2,
  BarChart3,
  Webhook,
  ArrowRight,
  CheckCircle2,
  MousePointerClick,
  Eye,
  Send,
  Menu,
  X,
} from 'lucide-react';
import LiveBackground from '@/components/LiveBackground';
import Unified3DCanvas from '@/components/Unified3DCanvas';
import BlackHoleCanvas from '@/components/BlackHoleCanvas';
import Scroll3DCard from '@/components/Scroll3DCard';

/* ── Navigation ── */
function Navbar() {
  const [open, setOpen] = React.useState(false);
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#F3F4F6' }}>FormFlow</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden-mobile">
          <Link href="/builder" style={{ color: '#818CF8', textDecoration: 'none', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚡ Form Builder
          </Link>
          <a href="#features" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Features</a>
          <a href="#builder-features" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Posters & Themes</a>
          <a href="#how-it-works" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>How It Works</a>
          <Link href="/login" className="btn btn-ghost btn-sm">Log In</Link>
          <Link href="/builder" className="btn btn-primary btn-sm">Start Building</Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="btn btn-ghost"
          style={{ display: 'none', padding: 8 }}
          id="mobile-nav-toggle"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          style={{
            background: 'var(--card-bg)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Link href="/builder" style={{ color: '#818CF8', fontWeight: 700, textDecoration: 'none' }} onClick={() => setOpen(false)}>⚡ Start Building (Drag & Drop)</Link>
          <a href="#features" style={{ color: '#F3F4F6', textDecoration: 'none' }} onClick={() => setOpen(false)}>Features</a>
          <a href="#builder-features" style={{ color: '#F3F4F6', textDecoration: 'none' }} onClick={() => setOpen(false)}>Posters & Themes</a>
          <a href="#how-it-works" style={{ color: '#F3F4F6', textDecoration: 'none' }} onClick={() => setOpen(false)}>How It Works</a>
          <Link href="/login" onClick={() => setOpen(false)}>Log In</Link>
          <Link href="/builder" className="btn btn-primary" onClick={() => setOpen(false)}>Start Building Free</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          #mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section
      style={{
        paddingTop: 140,
        paddingBottom: 80,
        textAlign: 'center',
        maxWidth: 900,
        margin: '0 auto',
        padding: '140px 24px 80px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: 999,
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#A5B4FC',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        ✨ Free for students & clubs
      </div>

      <h1
        style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          color: '#F3F4F6',
          marginBottom: 20,
          letterSpacing: '-0.02em',
        }}
      >
        Build Smarter Forms.{' '}
        <span style={{ background: 'linear-gradient(135deg, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Automate Every Response.
        </span>
      </h1>

      <p
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#9CA3AF',
          maxWidth: 600,
          margin: '0 auto 40px',
          lineHeight: 1.7,
        }}
      >
        Create powerful forms, surveys and conditional workflows visually — without writing code.
      </p>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <Link
          href="/builder"
          className="btn btn-primary btn-lg"
          style={{
            fontSize: 16,
            borderRadius: 12,
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #4F7C7A, #3F6258)',
            boxShadow: '0 8px 24px rgba(79, 124, 122, 0.28)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          ⚡ Start Building Form (Drag & Drop) <ArrowRight size={18} />
        </Link>
        <Link href="#builder-features" className="btn btn-secondary btn-lg" style={{ fontSize: 16, borderRadius: 12, padding: '14px 24px' }}>
          🎨 Custom Backgrounds & Posters
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
        <span style={{ fontSize: 12, padding: '6px 14px', background: 'rgba(207,229,227,0.2)', borderRadius: 20, color: '#C7D2FE', fontWeight: 600 }}>
          ✨ Drag & Drop Builder (dnd-kit)
        </span>
        <span style={{ fontSize: 12, padding: '6px 14px', background: 'rgba(207,229,227,0.2)', borderRadius: 20, color: '#C7D2FE', fontWeight: 600 }}>
          🎨 Solid, Gradients & Patterns
        </span>
        <span style={{ fontSize: 12, padding: '6px 14px', background: 'rgba(207,229,227,0.2)', borderRadius: 20, color: '#C7D2FE', fontWeight: 600 }}>
          🖼️ Custom Form Posters & Banners
        </span>
      </div>

      {/* Product Preview */}
      <div
        style={{
          marginTop: 60,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.15)',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 200px',
            minHeight: 320,
            fontSize: 13,
          }}
        >
          {/* Left panel */}
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, color: '#A5B4FC', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Field Types</div>
            {['Short Text', 'Paragraph', 'Multiple Choice', 'Rating Stars', 'File Upload', 'Date Picker'].map((t, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginBottom: 4,
                  background: i === 0 ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: i === 0 ? '#C7D2FE' : '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                {t}
              </div>
            ))}
          </div>

          {/* Center canvas with Poster Preview */}
          <div style={{ padding: 0, overflow: 'hidden' }}>
            {/* Poster Header */}
            <div style={{ position: 'relative', height: 90, overflow: 'hidden', background: '#0F172A' }}>
              <img
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
                alt="Form Poster"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8px 16px', color: 'white' }}>
                <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: 10, width: 'fit-content', fontWeight: 600, marginBottom: 2 }}>Poster Header</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Innov8 Hackathon 2026</span>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#F3F4F6' }}>Participant Registration</span>
                <Link href="/builder" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Open Live Builder →</Link>
              </div>
              {[
                { label: 'Full Name', type: 'Short Text' },
                { label: 'Are you a student?', type: 'Multiple Choice' },
                { label: 'Rate your experience', type: 'Rating' },
              ].map((q, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: '10px 14px',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'grab',
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 13, color: '#F3F4F6' }}>{q.label}</span>
                    <span style={{ color: '#818CF8', fontSize: 11, marginLeft: 8 }}>{q.type}</span>
                  </div>
                  <span style={{ color: '#6B7280' }}>⋮⋮</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, color: '#A5B4FC', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Properties</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Question</div>
              <div style={{ padding: '6px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 13, background: 'rgba(15, 23, 42, 0.8)', color: '#F3F4F6' }}>Full Name</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Required</div>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: '#6366F1', position: 'relative' }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: 'white', position: 'absolute', top: 2, right: 2 }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Placeholder</div>
              <div style={{ padding: '6px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 13, color: '#6B7280', background: 'rgba(15, 23, 42, 0.8)' }}>Enter name...</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div:last-child > div {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          section > div:last-child > div > div:first-child,
          section > div:last-child > div > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ── Builder Showcase: Drag & Drop, Backgrounds & Posters ── */
function BuilderShowcaseSection() {
  return (
    <section id="builder-features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 54 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 999,
            background: 'var(--accent)',
            color: 'var(--deep-sage)',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          ✨ New Visual Studio
        </div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#263B3B', marginBottom: 14 }}>
          Drag-and-Drop Building, Custom Backgrounds & Posters
        </h2>
        <p style={{ color: '#52796F', maxWidth: 640, margin: '0 auto', fontSize: 16, lineHeight: 1.6 }}>
          Design stunning, on-brand forms in seconds with our fluid drag-and-drop canvas, customizable backdrop styling, and visual header posters.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 40 }}>
        {/* Feature 1: Drag and drop */}
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #EAF4F4, #CFE5E3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                marginBottom: 20,
              }}
            >
              <MousePointerClick size={26} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#263B3B', marginBottom: 10 }}>
              Drag & Drop Questions
            </h3>
            <p style={{ color: '#52796F', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Powered by <strong>@dnd-kit</strong>. Seamlessly drag question blocks onto the canvas, grab handles to reorder questions in real-time, and duplicate or delete with a single click.
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 14, border: '1px solid rgba(184,206,207,0.4)', fontSize: 12, color: '#475569' }}>
            ✓ Short text, paragraphs, ratings, multiple choices, dates & files
          </div>
        </div>

        {/* Feature 2: Background Customizer */}
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A',
                marginBottom: 20,
              }}
            >
              <Palette size={26} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#263B3B', marginBottom: 10 }}>
              Custom Backgrounds & Gradients
            </h3>
            <p style={{ color: '#52796F', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Elevate your forms beyond plain white pages. Switch between curated color themes, smooth CSS gradients (Sunset, Aurora, Deep Ocean), subtle dot/grid architectural patterns, or upload custom wallpaper.
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 14, border: '1px solid rgba(184,206,207,0.4)', fontSize: 12, color: '#475569' }}>
            ✓ Solid colors, multi-stop gradients, mesh patterns & custom images
          </div>
        </div>

        {/* Feature 3: Posters & Header Banners */}
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EA580C',
                marginBottom: 20,
              }}
            >
              <Eye size={26} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#263B3B', marginBottom: 10 }}>
              Add Posters & Cover Banners
            </h3>
            <p style={{ color: '#52796F', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Upload your event, hackathon, or organization poster directly into the form header. Choose custom banner heights, tint overlays, and display custom event titles and subtitles on top.
            </p>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 14, border: '1px solid rgba(184,206,207,0.4)', fontSize: 12, color: '#475569' }}>
            ✓ Direct image file upload, curated presets, overlay dimming & titles
          </div>
        </div>
      </div>

      {/* Direct CTA Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4F7C7A 0%, #365F5D 100%)',
          borderRadius: 16,
          padding: '40px 32px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
          boxShadow: '0 12px 32px rgba(38, 59, 59, 0.16)',
        }}
      >
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px 0' }}>
            Ready to design your customized form?
          </h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 15, maxWidth: 520 }}>
            Open the visual drag & drop builder immediately. Add questions, pick your background, and upload a poster in real time.
          </p>
        </div>

        <Link
          href="/builder"
          className="btn btn-secondary btn-lg"
          style={{
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 10,
            background: 'white',
            color: '#263B3B',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ⚡ Open Form Builder Now <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

/* ── Features ── */
const features = [
  { icon: Layers, title: 'Visual Form Builder', desc: 'Drag-and-drop fields onto a visual canvas. Configure properties, validations, and layouts without any code.' },
  { icon: GitBranch, title: 'Conditional Logic', desc: 'Create smart branching workflows. Show, hide, or jump to questions based on user responses.' },
  { icon: Palette, title: 'Custom Themes', desc: 'Customize colors, fonts, layouts and branding. Make every form match your organization\'s identity.' },
  { icon: Share2, title: 'Public Shareable Links', desc: 'Publish forms instantly with a unique URL. Share via email, social media, or embed in websites.' },
  { icon: BarChart3, title: 'Response Analytics', desc: 'Visualize responses with charts and graphs. Track submissions, ratings, and trends in real-time.' },
  { icon: Webhook, title: 'Webhook Integrations', desc: 'Trigger external services on every submission. Connect to Slack, Zapier, Discord, or any API endpoint.' },
];

function Features() {
  return (
    <section id="features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#F3F4F6', marginBottom: 12 }}>
          Everything you need to build powerful forms
        </h2>
        <p style={{ color: '#9CA3AF', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
          A complete toolkit for creating, distributing, and analyzing forms and surveys.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}
      >
        {features.map((f, i) => (
          <Scroll3DCard key={i}>
            <div className="card" style={{ padding: 32 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  color: '#818CF8',
                }}
              >
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F3F4F6', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          </Scroll3DCard>
        ))}
      </div>
    </section>
  );
}

/* ── How It Works ── */
const steps = [
  { icon: MousePointerClick, title: 'Design Your Form', desc: 'Drag fields onto the canvas and configure every detail with the properties panel.' },
  { icon: GitBranch, title: 'Add Smart Logic', desc: 'Build conditional rules so your form adapts to each respondent\'s answers.' },
  { icon: Eye, title: 'Preview & Publish', desc: 'Preview on any device, then publish with one click to generate a shareable link.' },
  { icon: Send, title: 'Collect & Analyze', desc: 'Responses stream in real-time. View analytics, export data, and trigger webhooks.' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#F3F4F6', marginBottom: 12 }}>How It Works</h2>
        <p style={{ color: '#9CA3AF', maxWidth: 500, margin: '0 auto', fontSize: 16 }}>Four simple steps from idea to insights.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((s, i) => (
          <Scroll3DCard key={i}>
            <div
              style={{
                display: 'flex',
                gap: 24,
                alignItems: 'flex-start',
                position: 'relative',
                paddingBottom: i < steps.length - 1 ? 48 : 0,
              }}
            >
              {/* Line */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 23,
                    top: 48,
                    bottom: 0,
                    width: 2,
                    background: 'linear-gradient(to bottom, #6366F1, rgba(99,102,241,0.2))',
                  }}
                />
              )}

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: '0 0 15px rgba(99,102,241,0.4)',
                }}
              >
                <s.icon size={22} />
              </div>

              <div style={{ paddingTop: 4 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F3F4F6', marginBottom: 6 }}>
                  <span style={{ color: '#818CF8', marginRight: 8 }}>0{i + 1}</span>
                  {s.title}
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </div>
          </Scroll3DCard>
        ))}
      </div>
    </section>
  );
}

/* ── Conditional Logic Demo ── */
function LogicDemo() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#F3F4F6', marginBottom: 12 }}>
          Conditional Logic That Actually Works
        </h2>
        <p style={{ color: '#9CA3AF', maxWidth: 500, margin: '0 auto', fontSize: 16 }}>
          Build branching paths so respondents only see relevant questions.
        </p>
      </div>

      <Scroll3DCard>
        <div className="card" style={{ padding: 32, maxWidth: 600, margin: '0 auto', background: 'rgba(15, 23, 42, 0.85)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ background: '#6366F1', color: 'white', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>IF</span>
              <div style={{ flex: 1, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 14, color: '#F3F4F6', background: 'rgba(30, 41, 59, 0.6)' }}>
                &quot;Are you a student?&quot;
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)' }}>EQUALS</span>
              <div style={{ flex: 1, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 14, color: '#F3F4F6', background: 'rgba(30, 41, 59, 0.6)' }}>
                &quot;Yes&quot;
              </div>
            </div>

            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.12)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>THEN</span>
                <span style={{ fontSize: 14, color: '#F3F4F6' }}>Show &quot;College Name&quot;</span>
                <CheckCircle2 size={16} style={{ color: '#34D399' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>AND</span>
                <span style={{ fontSize: 14, color: '#F3F4F6' }}>Show &quot;Year of Study&quot;</span>
                <CheckCircle2 size={16} style={{ color: '#34D399' }} />
              </div>
            </div>
          </div>
        </div>
      </Scroll3DCard>
    </section>
  );
}

/* ── Analytics Demo ── */
function AnalyticsDemo() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#F3F4F6', marginBottom: 12 }}>
          Real-Time Analytics & Insights
        </h2>
        <p style={{ color: '#9CA3AF', maxWidth: 500, margin: '0 auto', fontSize: 16 }}>
          Watch responses come in live. Understand your data at a glance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
        {[
          { label: 'Total Responses', value: '1,247', change: '+12%' },
          { label: 'Completion Rate', value: '89%', change: '+3%' },
          { label: 'Avg. Rating', value: '4.6 ★', change: '+0.2' },
          { label: 'Today', value: '34', change: '+8' },
        ].map((s, i) => (
          <Scroll3DCard key={i}>
            <div className="card" style={{ padding: 24, textAlign: 'center', background: 'rgba(15, 23, 42, 0.85)' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#F3F4F6', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>{s.label}</div>
              <span style={{ fontSize: 12, color: '#34D399', fontWeight: 600 }}>{s.change}</span>
            </div>
          </Scroll3DCard>
        ))}
      </div>
    </section>
  );
}

/* ── Integrations ── */
function Integrations() {
  return (
    <section id="integrations" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: '#F3F4F6', marginBottom: 12 }}>
        Connect to Your Favorite Tools
      </h2>
      <p style={{ color: '#9CA3AF', maxWidth: 500, margin: '0 auto 40px', fontSize: 16 }}>
        Trigger webhooks on every form submission. Integrate with Slack, Discord, Zapier, and any custom endpoint.
      </p>

      <Scroll3DCard>
        <div className="card" style={{ padding: 32, maxWidth: 500, margin: '0 auto', textAlign: 'left', background: 'rgba(15, 23, 42, 0.85)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#F3F4F6' }}>Webhook Configuration</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Webhook URL</div>
            <div style={{ padding: '8px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 13, color: '#9CA3AF', background: 'rgba(30, 41, 59, 0.6)' }}>
              https://hooks.slack.com/services/...
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="btn btn-primary btn-sm">Save Webhook</div>
            <div className="btn btn-secondary btn-sm">Test Webhook</div>
          </div>
        </div>
      </Scroll3DCard>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  return (
    <section
      style={{
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Scroll3DCard>
        <div
          className="card"
          style={{
            maxWidth: 700,
            margin: '0 auto',
            padding: '60px 40px',
            background: 'linear-gradient(135deg, rgba(30,27,75,0.8), rgba(99,102,241,0.2))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 0 40px rgba(99,102,241,0.2)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#F3F4F6', marginBottom: 12 }}>
            Ready to build smarter forms?
          </h2>
          <p style={{ color: '#9CA3AF', marginBottom: 32, fontSize: 16 }}>
            Start creating in minutes. No credit card required.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg" style={{ fontSize: 16, borderRadius: 12 }}>
            Get Started for Free <ArrowRight size={18} />
          </Link>
        </div>
      </Scroll3DCard>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          F
        </div>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#F3F4F6' }}>FormFlow</span>
      </div>
      <p style={{ color: '#9CA3AF', fontSize: 13 }}>
        © {new Date().getFullYear()} FormFlow. Built with ❤️ for hackathons.
      </p>
    </footer>
  );
}

/* ── Page ── */
export default function LandingPage() {
  return (
    <>
      <LiveBackground />
      <BlackHoleCanvas />
      <Unified3DCanvas />
      <Navbar />
      <main>
        <Hero />
        <BuilderShowcaseSection />
        <Features />
        <HowItWorks />
        <LogicDemo />
        <AnalyticsDemo />
        <Integrations />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
