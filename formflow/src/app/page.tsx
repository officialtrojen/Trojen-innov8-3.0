'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Compass,
  Radio,
  Eye,
  Send,
  Share2,
  Cpu,
  ChevronDown,
  Satellite,
  Globe2,
} from 'lucide-react';

export default function ParallaxDeepSpaceLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState('hero');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Smooth scroll listener via requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth mouse movement for 3D cursor parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Active section spy for HUD
  useEffect(() => {
    if (scrollY < 700) setActiveSection('deep-space');
    else if (scrollY < 1600) setActiveSection('orbit-genesis');
    else if (scrollY < 2600) setActiveSection('telemetry-core');
    else if (scrollY < 3600) setActiveSection('void-logic');
    else setActiveSection('station-dock');
  }, [scrollY]);

  // Deep Starfield Canvas animation (Layer 0 & 1)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 180 stars with different depths (z: 1 to 4)
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 4,
      z: Math.random() * 3 + 0.6,
      radius: Math.random() * 1.3 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Deep pure space clear
      ctx.fillStyle = '#020306';
      ctx.fillRect(0, 0, width, height);

      // Draw each star with its parallax speed
      stars.forEach((star) => {
        // Multi-depth parallax calculation for starfield
        const starParallaxSpeed = 0.06 * star.z;
        const screenY = (star.y - scrollY * starParallaxSpeed) % (height * 3);
        const wrappedY = screenY < 0 ? screenY + height * 3 : screenY;

        // Only draw if within visible viewport
        if (wrappedY >= -10 && wrappedY <= height + 10) {
          const mouseShiftX = mousePos.x * (star.z * 6);
          const mouseShiftY = mousePos.y * (star.z * 6);

          const brightness =
            star.alpha + Math.sin(frame * star.twinkleSpeed + star.twinkleOffset) * 0.25;
          const clampedBrightness = Math.max(0.1, Math.min(1, brightness));

          ctx.beginPath();
          ctx.arc(
            star.x + mouseShiftX,
            wrappedY + mouseShiftY,
            star.radius,
            0,
            Math.PI * 2
          );
          ctx.fillStyle =
            star.z > 2.5
              ? `rgba(224, 242, 254, ${clampedBrightness})`
              : star.z > 1.5
              ? `rgba(203, 213, 225, ${clampedBrightness * 0.8})`
              : `rgba(148, 163, 184, ${clampedBrightness * 0.5})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [scrollY, mousePos]);

  // Computed Space Depth in Astronomical Units
  const depthAU = Math.round(120 + scrollY * 4.2);

  return (
    <div
      style={{
        background: '#020306',
        color: '#E2E8F0',
        minHeight: '480vh',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ========================================================================= */}
      {/* LAYER 0 & 1: FIXED MULTI-DEPTH STARFIELD CANVAS                           */}
      {/* ========================================================================= */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Subtle Cosmic Depth Vignette (Pure Deep Black Space) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background:
            'radial-gradient(ellipse 90% 75% at 50% 50%, transparent 40%, rgba(2, 3, 6, 0.75) 85%, #020306 100%)',
        }}
      />

      {/* ========================================================================= */}
      {/* LAYER 5: FOREGROUND INTERFACE & STORY CONTENT                             */}
      {/* Generous black space voids, clean minimalist typography                   */}
      {/* ========================================================================= */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Minimal Navigation */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            background: scrollY > 40 ? 'rgba(2, 3, 6, 0.85)' : 'transparent',
            backdropFilter: scrollY > 40 ? 'blur(16px)' : 'none',
            borderBottom:
              scrollY > 40 ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid transparent',
            transition: 'all 0.3s ease',
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E2E8F0',
              }}
            >
              <Layers size={18} />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              FormFlow <span style={{ color: '#64748B', fontWeight: 400 }}>Cosmic</span>
            </span>
          </div>

          <nav
            style={{ display: 'flex', alignItems: 'center', gap: 28 }}
            className="hidden-mobile"
          >
            <a
              href="#architecture"
              style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', fontWeight: 500 }}
            >
              Depth Layers
            </a>
            <a
              href="#builder-orbit"
              style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', fontWeight: 500 }}
            >
              Orbit Engine
            </a>
            <a
              href="#telemetry"
              style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', fontWeight: 500 }}
            >
              Telemetry
            </a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link
              href="/login"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#CBD5E1',
                textDecoration: 'none',
                padding: '8px 16px',
              }}
            >
              Sign In
            </Link>
            <Link
              href="/builder"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#020306',
                background: '#F8FAFC',
                padding: '9px 18px',
                borderRadius: 8,
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)',
                transition: 'all 0.2s ease',
              }}
            >
              Launch Studio →
            </Link>
          </div>
        </header>

        {/* SECTION 1: HERO VIEWPORT (Vast Calm Black Space) */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '140px 8vw 60px',
            maxWidth: 1200,
          }}
        >
          {/* Subtle Status Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: 'fit-content',
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#38BDF8',
                boxShadow: '0 0 8px #38BDF8',
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#94A3B8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Multi-Depth Parallax Architecture • v3.0
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: '0 0 24px',
              maxWidth: 820,
            }}
          >
            Forms engineered across dimensions of depth.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              color: '#94A3B8',
              lineHeight: 1.7,
              maxWidth: 580,
              margin: '0 0 44px',
              fontWeight: 400,
            }}
          >
            Move through an independent multi-layered cosmos. Background starfields, celestial
            midground bodies, orbital stations, and foreground intelligence move at autonomous
            speeds as you scroll.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              href="/builder"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: '#FFFFFF',
                color: '#020306',
                padding: '14px 28px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(255, 255, 255, 0.18)',
              }}
            >
              Build New Form <ArrowRight size={16} />
            </Link>

            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '14px 24px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              <Compass size={16} style={{ color: '#94A3B8' }} /> Explore Workspace
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div
            style={{
              marginTop: '12vh',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#64748B',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <ChevronDown size={16} style={{ animation: 'bounce 2s infinite' }} />
            <span>Scroll downward to activate multi-depth parallax layers</span>
          </div>
        </section>

        {/* GENEROUS CALM BLACK SPACE VOID */}
        <div style={{ height: '35vh' }} />

        {/* SECTION 2: DEPTH ARCHITECTURE (MIDGROUND PARALLAX ENCOUNTER) */}
        <section
          id="architecture"
          style={{
            padding: '80px 8vw',
            maxWidth: 1240,
            margin: '0 auto',
          }}
        >
          <div style={{ maxWidth: 640, marginBottom: 56 }}>
            <span
              style={{
                fontSize: 12,
                color: '#38BDF8',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 10,
              }}
            >
              Layer Separation Matrix
            </span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                lineHeight: 1.15,
                margin: '0 0 16px',
              }}
            >
              Independent movement across four optical planes.
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              Each element exists on an isolated z-coordinate. As viewport scroll velocity changes,
              background geometry and midground vehicles shift at fractional speeds.
            </p>
          </div>

          {/* 3 Architecture Glassmorphism Cards with generous black space */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            <div
              style={{
                padding: '32px 28px',
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  marginBottom: 20,
                }}
              >
                <Globe2 size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>
                Layer 01 • Deep Celestial Horizon
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                Infinite canvas starfield and concentric ringed planets rendered at 0.18x scroll
                velocity. Distant, calm, and unchanging.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                SPEED VELOCITY: 0.18x • DEPTH: 12,000 AU
              </div>
            </div>

            <div
              style={{
                padding: '32px 28px',
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E2E8F0',
                  marginBottom: 20,
                }}
              >
                <Satellite size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>
                Layer 02 • Orbital Midground
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                Modular space stations and golden reconnaissance satellites drifting at 0.42x and
                0.65x velocities, responding dynamically to mouse cursor angle.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                SPEED VELOCITY: 0.55x • DEPTH: 4,500 AU
              </div>
            </div>

            <div
              style={{
                padding: '32px 28px',
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C084FC',
                  marginBottom: 20,
                }}
              >
                <Cpu size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>
                Layer 03 • Intelligence Foreground
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                High-contrast typography, interactive form logic builders, and real-time response
                graphs locked to native scroll for optimal readability.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                SPEED VELOCITY: 1.00x • FOREGROUND
              </div>
            </div>
          </div>
        </section>

        {/* GENEROUS CALM BLACK SPACE VOID */}
        <div style={{ height: '40vh' }} />

        {/* SECTION 3: THE FORM ENGINE ORBIT (Interactive Capabilities) */}
        <section
          id="builder-orbit"
          style={{
            padding: '80px 8vw',
            maxWidth: 1240,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              background: 'rgba(8, 12, 20, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: 24,
              padding: 'clamp(36px, 6vw, 64px)',
              backdropFilter: 'blur(16px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 48,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38BDF8',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 16,
                }}
              >
                <Radio size={12} /> Autonomous Logic & Distribution
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  margin: '0 0 20px',
                }}
              >
                Instant URL Generation & Real-time Submissions
              </h2>
              <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, margin: '0 0 28px' }}>
                Publish a form with one click to receive an immutable shareable URL. Send it to
                anyone anywhere in the world—responses feed directly into your encrypted dashboard
                analytics without respondent signups.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500 }}>
                    Instant shareable link with QR code & one-click clipboard copy
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500 }}>
                    Conditional skip branching & mathematical logic rules
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500 }}>
                    Live customizable posters, backgrounds & typography themes
                  </span>
                </div>
              </div>
            </div>

            {/* Mocked Glass Studio Telemetry Box */}
            <div
              style={{
                background: '#040711',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 16,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: 18,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                    Live Form Distribution
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                  STATUS: LIVE
                </span>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: '#94A3B8',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 240,
                  }}
                >
                  https://formflow.app/f/voyager-expedition
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#38BDF8',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Copy URL
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '14px 8px',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>1,842</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Submissions</div>
                </div>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '14px 8px',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#38BDF8' }}>98.4%</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Completion</div>
                </div>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '14px 8px',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981' }}>18ms</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Latency</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GENEROUS CALM BLACK SPACE VOID */}
        <div style={{ height: '45vh' }} />

        {/* SECTION 4: CALL TO ACTION IN DEEP SPACE */}
        <section
          id="telemetry"
          style={{
            padding: '100px 8vw 140px',
            textAlign: 'center',
            maxWidth: 820,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#38BDF8',
            }}
          >
            <Sparkles size={24} />
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4.4vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              lineHeight: 1.15,
              margin: '0 0 20px',
            }}
          >
            Ready to deploy your next form?
          </h2>

          <p
            style={{
              color: '#94A3B8',
              fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
              lineHeight: 1.7,
              maxWidth: 540,
              margin: '0 auto 36px',
            }}
          >
            Experience intuitive drag-and-drop form building with multi-depth custom poster themes,
            advanced validation, and effortless response tracking.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/builder"
              style={{
                background: '#FFFFFF',
                color: '#020306',
                padding: '14px 32px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 28px rgba(255, 255, 255, 0.2)',
              }}
            >
              Start Building Free →
            </Link>

            <Link
              href="/login"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                padding: '14px 28px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Sign In to Account
            </Link>
          </div>
        </section>

        {/* Minimal Cosmic Footer */}
        <footer
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '36px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1300,
            margin: '0 auto',
            fontSize: 13,
            color: '#64748B',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>© 2026 FormFlow. Built with ❤️ by team trojen</div>

          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/builder" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              Form Studio
            </Link>
            <Link href="/dashboard" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <Link href="/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              Login
            </Link>
            <Link href="/signup" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING TELEMETRY HUD (Depth & Active Layer Indicator)                   */}
      {/* ========================================================================= */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 28,
          zIndex: 90,
          background: 'rgba(2, 4, 8, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '10px 16px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: 12,
          color: '#94A3B8',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#38BDF8',
              boxShadow: '0 0 6px #38BDF8',
            }}
          />
          <span style={{ color: '#CBD5E1', fontWeight: 600 }}>Parallax Active</span>
        </div>
        <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.1)' }} />
        <div>
          Depth: <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{depthAU.toLocaleString()} AU</span>
        </div>
        <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={{ textTransform: 'capitalize' }}>{activeSection.replace('-', ' ')}</div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
