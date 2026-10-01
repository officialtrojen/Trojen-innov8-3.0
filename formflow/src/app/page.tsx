'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Layers,
  ArrowRight,
  Radio,
  Eye,
  Send,
  Share2,
  Cpu,
  Satellite,
  Globe2,
  X,
  PlusCircle,
  AlertCircle,
  User,
  LogOut,
  Pencil,
  Settings,
  LayoutDashboard,
  Check,
} from 'lucide-react';
import { useAuth, AuthProvider } from '@/components/AuthProvider';
import ReorderingFeatures from '@/components/ReorderingFeatures';

function ParallaxDeepSpaceLandingPageInner() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState('hero');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auth & Profile state
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync edit name with current profile/user info
  useEffect(() => {
    if (profile?.name) {
      setEditName(profile.name);
    } else if (user?.user_metadata?.name || user?.user_metadata?.full_name) {
      setEditName(user.user_metadata.name || user.user_metadata.full_name);
    } else if (user?.email) {
      setEditName(user.email.split('@')[0]);
    }
  }, [profile, user]);

  // Click-outside listener for profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileMenuOpen]);

  const displayName =
    profile?.name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'User');
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const initialLetter = displayName.charAt(0).toUpperCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editName.trim() || savingProfile) return;
    setSavingProfile(true);
    try {
      const supabase = createClient();
      await supabase.from('profiles').upsert({
        id: user.id,
        name: editName.trim(),
        email: user.email?.toLowerCase(),
        updated_at: new Date().toISOString(),
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditProfileOpen(false);
      }, 900);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Form creation modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formNameError, setFormNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formName.trim();
    if (!trimmed) {
      setFormNameError('Please provide a form name.');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: existing } = await supabase
          .from('forms')
          .select('id')
          .eq('owner_id', authData.user.id)
          .ilike('title', trimmed)
          .maybeSingle();

        if (existing) {
          setFormNameError(`A form named "${trimmed}" already exists in your account.`);
          setSubmitting(false);
          return;
        }
      }

      setCreateModalOpen(false);
      const titleParam = encodeURIComponent(trimmed);
      const descParam = encodeURIComponent(formDesc.trim());
      router.push(`/builder?title=${titleParam}&description=${descParam}&new=true`);
    } catch (err) {
      console.error('Error checking form name:', err);
      setCreateModalOpen(false);
      router.push(`/builder?title=${encodeURIComponent(trimmed)}&description=${encodeURIComponent(formDesc.trim())}&new=true`);
    } finally {
      setSubmitting(false);
    }
  };

  const targetScrollYRef = useRef(0);
  const smoothScrollYRef = useRef(0);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });

  // Smooth scroll listener via requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      targetScrollYRef.current = window.scrollY;
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
      targetMouseRef.current = { x, y };
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

    // Create 220 larger, more luminous stars with multi-depth parallax
    const stars = Array.from({ length: 220 }, () => {
      const z = Math.random() * 3.2 + 0.8;
      // Noticeably bigger stars across all depth layers
      let radius = Math.random() * 1.2 + 1.5; // base: 1.5px - 2.7px
      if (z > 2.8) {
        radius = Math.random() * 2.2 + 3.2; // hero stars: 3.2px - 5.4px
      } else if (z > 1.8) {
        radius = Math.random() * 1.6 + 2.2; // mid stars: 2.2px - 3.8px
      }

      return {
        x: Math.random() * width,
        y: Math.random() * height * 4,
        z,
        radius,
        hasGlow: z > 2.6,
        alpha: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
      };
    });

    let frame = 0;
    const render = () => {
      frame++;

      // Silky-smooth interpolation (LERP) for scroll and cursor movement
      smoothScrollYRef.current += (targetScrollYRef.current - smoothScrollYRef.current) * 0.075;
      smoothMouseRef.current.x += (targetMouseRef.current.x - smoothMouseRef.current.x) * 0.05;
      smoothMouseRef.current.y += (targetMouseRef.current.y - smoothMouseRef.current.y) * 0.05;

      const currentSmoothScroll = smoothScrollYRef.current;
      const currentMouseX = smoothMouseRef.current.x;
      const currentMouseY = smoothMouseRef.current.y;

      ctx.clearRect(0, 0, width, height);

      // Deep obsidian space background
      ctx.fillStyle = '#020306';
      ctx.fillRect(0, 0, width, height);

      // Draw each star with smooth parallax position
      stars.forEach((star) => {
        const starParallaxSpeed = 0.065 * star.z;
        const screenY = (star.y - currentSmoothScroll * starParallaxSpeed) % (height * 3);
        const wrappedY = screenY < 0 ? screenY + height * 3 : screenY;

        // Viewport bounds check
        if (wrappedY >= -20 && wrappedY <= height + 20) {
          const mouseShiftX = currentMouseX * (star.z * 7);
          const mouseShiftY = currentMouseY * (star.z * 7);
          const centerX = star.x + mouseShiftX;
          const centerY = wrappedY + mouseShiftY;

          const brightness =
            star.alpha + Math.sin(frame * star.twinkleSpeed + star.twinkleOffset) * 0.28;
          const clampedBrightness = Math.max(0.15, Math.min(1, brightness));

          // Soft cosmic glow aura for larger hero stars
          if (star.hasGlow) {
            const glowRadius = star.radius * 2.8;
            const glowGrad = ctx.createRadialGradient(
              centerX,
              centerY,
              0,
              centerX,
              centerY,
              glowRadius
            );
            glowGrad.addColorStop(0, `rgba(56, 189, 248, ${clampedBrightness * 0.45})`);
            glowGrad.addColorStop(0.5, `rgba(139, 92, 246, ${clampedBrightness * 0.2})`);
            glowGrad.addColorStop(1, 'rgba(2, 3, 6, 0)');

            ctx.beginPath();
            ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();
          }

          // Crisp luminous star core
          ctx.beginPath();
          ctx.arc(centerX, centerY, star.radius, 0, Math.PI * 2);
          ctx.fillStyle =
            star.z > 2.8
              ? `rgba(255, 255, 255, ${clampedBrightness})`
              : star.z > 1.8
              ? `rgba(224, 242, 254, ${clampedBrightness * 0.95})`
              : `rgba(186, 230, 253, ${clampedBrightness * 0.75})`;
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
  }, []);

  return (
    <div
      style={{
        background: '#020306',
        color: '#E2E8F0',

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
              FormFlow
            </span>
          </div>


          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {!user ? (
              <Link
                href="/login"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#CBD5E1',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  transition: 'color 0.15s ease',
                }}
              >
                Sign In
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setFormName('');
                setFormDesc('');
                setFormNameError(null);
                setCreateModalOpen(true);
              }}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#020306',
                background: '#F8FAFC',
                padding: '9px 18px',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Launch Studio →
            </button>

            {user && (
              <div style={{ position: 'relative' }} ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  title={displayName}
                  aria-label="User Profile Menu"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: avatarUrl
                      ? 'transparent'
                      : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    border: profileMenuOpen
                      ? '2px solid #818CF8'
                      : '2px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 14,
                    padding: 0,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: profileMenuOpen
                      ? '0 0 16px rgba(99, 102, 241, 0.5)'
                      : '0 2px 8px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span>{initialLetter}</span>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 260,
                      background: 'rgba(15, 23, 42, 0.96)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 14,
                      padding: 12,
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
                      zIndex: 1000,
                    }}
                  >
                    {/* User Summary Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '6px 8px 12px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: avatarUrl
                            ? 'transparent'
                            : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: 16,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          initialLetter
                        )}
                      </div>
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#F8FAFC',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {displayName}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#94A3B8',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: 1,
                          }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setEditName(displayName);
                          setEditProfileOpen(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: 'transparent',
                          border: 'none',
                          color: '#E2E8F0',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Pencil size={15} style={{ color: '#818CF8' }} />
                        <span>Edit Profile</span>
                      </button>

                      <Link
                        href="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: '#E2E8F0',
                          fontSize: 13,
                          fontWeight: 500,
                          textDecoration: 'none',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LayoutDashboard size={15} style={{ color: '#38BDF8' }} />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: '#E2E8F0',
                          fontSize: 13,
                          fontWeight: 500,
                          textDecoration: 'none',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Settings size={15} style={{ color: '#94A3B8' }} />
                        <span>Account Settings</span>
                      </Link>

                      <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          signOut('/');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: 'transparent',
                          border: 'none',
                          color: '#F87171',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LogOut size={15} style={{ color: '#F87171' }} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* SECTION 1: HERO VIEWPORT */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '160px 8vw 48px',
            maxWidth: 1200,
          }}
        >
          {/* Subtle Status Pill */}
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
            Build stunning forms in minutes, not hours.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              color: '#94A3B8',
              lineHeight: 1.7,
              maxWidth: 580,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Drag-and-drop form builder with conditional logic, real-time analytics,
            and beautiful themes — no code required.
          </p>
        </section>

        {/* SECTION 2: DEPTH ARCHITECTURE */}
        <section
          id="architecture"
          style={{
            padding: '48px 8vw 60px',
            maxWidth: 1240,
            margin: '0 auto',
          }}
        >
          <div style={{ maxWidth: 680, marginBottom: 56 }}>
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
              Everything you need to create, automate, and scale forms.
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              A modular form infrastructure engineered for speed. Build intuitive multi-step questions,
              automate complex logic without code, and monitor submissions in real time.
            </p>
          </div>

          {/* 3 Workflow Architecture Glassmorphism Cards */}
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
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>
                Phase 01 • Visual Canvas Builder
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                Drag and drop from 10+ smart field types, customize fonts and branding, and preview your
                form across desktop and mobile screens instantly.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.04em' }}>
                10+ FIELD TYPES • LIVE PREVIEW CANVAS
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
                Phase 02 • Autonomous Logic Engine
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                Configure intelligent skip logic, calculated fields, and conditional visibility so respondents
                only see questions relevant to their answers.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#C084FC', letterSpacing: '0.04em' }}>
                ZERO-CODE RULES • ADAPTIVE BRANCHING
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
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399',
                  marginBottom: 20,
                }}
              >
                <Radio size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>
                Phase 03 • Distribution & Live Telemetry
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                Generate instant public URLs and QR codes for sharing. Track responses with live metrics,
                completion rates, and one-click export to CSV/Excel.
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#34D399', letterSpacing: '0.04em' }}>
                REAL-TIME FEEDS • 1-CLICK EXCEL & CSV
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: REORDERING 4-BOX WEBSITE FEATURES */}
        <section
          id="features"
          style={{
            padding: '48px 4vw 60px',
            maxWidth: 1280,
            margin: '0 auto',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <ReorderingFeatures />
        </section>

        {/* SECTION 4: CALL TO ACTION IN DEEP SPACE */}
        <section
          id="telemetry"
          style={{
            padding: '60px 8vw 100px',
            textAlign: 'center',
            maxWidth: 820,
            margin: '0 auto',
          }}
        >
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
            <button
              type="button"
              onClick={() => {
                setFormName('');
                setFormDesc('');
                setFormNameError(null);
                setCreateModalOpen(true);
              }}
              style={{
                background: '#FFFFFF',
                color: '#020306',
                padding: '14px 32px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                boxShadow: '0 4px 28px rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              Start Building Free →
            </button>

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
            padding: '32px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 1300,
            margin: '0 auto',
            fontSize: 13,
            color: '#64748B',
          }}
        >
          <div>© 2026 FormFlow. Built with ❤️ by team trojen</div>
        </footer>
      </div>


      {/* Create Form Modal asking for Form Name and Description */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(2, 3, 6, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#080C1A',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              padding: '28px 24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <PlusCircle size={18} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                Launch Form Studio
              </h2>
            </div>

            <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Enter a form name and optional description to launch into the studio canvas.
            </p>

            <form onSubmit={handleModalSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>
                  Form Name <span style={{ color: '#F87171' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formNameError) setFormNameError(null);
                  }}
                  placeholder="e.g., Customer Feedback, Event RSVP"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: formNameError
                      ? '1px solid #EF4444'
                      : '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {formNameError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 8,
                      color: '#F87171',
                      fontSize: 12.5,
                      fontWeight: 500,
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    <AlertCircle size={15} color="#F87171" style={{ flexShrink: 0 }} />
                    <span>{formNameError}</span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>
                  Description <span style={{ color: '#64748B', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Briefly describe what this form is for..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ padding: '9px 18px', color: '#94A3B8' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formName.trim() || submitting}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: !formName.trim() || submitting ? 'not-allowed' : 'pointer',
                    opacity: !formName.trim() || submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14 }} />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <span>Launch Studio →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editProfileOpen && user && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingProfile) {
              setEditProfileOpen(false);
            }
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 440,
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818CF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pencil size={18} />
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  Edit Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                disabled={savingProfile}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#94A3B8',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Email Address
                </label>
                <input
                  type="text"
                  disabled
                  value={user.email || ''}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#64748B',
                    fontSize: 14,
                    cursor: 'not-allowed',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#CBD5E1',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Full Name <span style={{ color: '#F87171' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              {saveSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  <Check size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  disabled={savingProfile}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#CBD5E1',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile || !editName.trim()}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    background: '#6366F1',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: savingProfile || !editName.trim() ? 'not-allowed' : 'pointer',
                    opacity: savingProfile || !editName.trim() ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default function ParallaxDeepSpaceLandingPage() {
  return (
    <AuthProvider>
      <ParallaxDeepSpaceLandingPageInner />
    </AuthProvider>
  );
}
