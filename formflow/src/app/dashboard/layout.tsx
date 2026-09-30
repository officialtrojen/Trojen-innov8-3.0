'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageSquare,
  BarChart3,
  Webhook,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import LiveBackground from '@/components/LiveBackground';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  badge?: {
    text: string;
    variant: 'emerald' | 'cyan' | 'purple' | 'amber';
  };
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/forms', label: 'My Forms', icon: FileText },
    ],
  },
  {
    title: 'Data & Automation',
    items: [
      {
        href: '/dashboard/responses',
        label: 'Responses',
        icon: MessageSquare,
        badge: { text: 'Live', variant: 'emerald' },
      },
      {
        href: '/dashboard/analytics',
        label: 'Analytics',
        icon: BarChart3,
      },
      {
        href: '/dashboard/integrations',
        label: 'Integrations',
        icon: Webhook,
        badge: { text: 'Webhooks', variant: 'cyan' },
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    setSigningOut(true);
    signOut();
  };

  const isGoogle =
    user?.app_metadata?.provider === 'google' ||
    (user?.app_metadata?.providers as string[] | undefined)?.includes('google');

  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || 'Creator';
  const displayEmail = user?.email || 'user@formflow.io';
  const userInitial = (displayName || displayEmail || 'U')[0].toUpperCase();

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%' }}>
      {/* Brand Header - links to Landing Page */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <Link
          href="/"
          title="Return to Landing Page"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '4px 0',
          }}
        >
          {/* Exact squircle container & Layers icon from Landing Page */}
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
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Layers size={18} />
          </div>

          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
            }}
          >
            FormFlow
          </span>
        </Link>
      </div>

      {/* Primary CTA - Create Form Button matching Landing Page primary button */}
      <div style={{ padding: '0 12px', marginBottom: 18 }}>
        <Link
          href="/dashboard/forms/new"
          onClick={() => setMobileOpen(false)}
          className="create-form-btn-glow"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 9,
            background: '#FFFFFF',
            color: '#000000',
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusCircle size={16} color="#000000" />
            <span style={{ color: '#000000', fontWeight: 600 }}>Create Form</span>
          </div>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 6,
              background: '#000000',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Sparkles size={11} color="#FFFFFF" />
            <span>New</span>
          </span>
        </Link>
      </div>

      {/* Nav links grouped into clean sections */}
      <div style={{ flex: 1, paddingBottom: 16 }}>
        {navSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 14 }}>
            <div className="sidebar-nav-section-title">{section.title}</div>
            <div>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span className="link-icon">
                        <Icon size={17} />
                      </span>
                      <span>{item.label}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.badge && (
                        <span
                          className="link-badge"
                          style={{
                            background:
                              item.badge.variant === 'emerald'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(255, 255, 255, 0.08)',
                            color:
                              item.badge.variant === 'emerald'
                                ? '#34D399'
                                : '#E2E8F0',
                            border: `1px solid ${
                              item.badge.variant === 'emerald'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : 'rgba(255, 255, 255, 0.15)'
                            }`,
                          }}
                        >
                          {item.badge.text}
                        </span>
                      )}
                      <ChevronRight
                        size={13}
                        style={{
                          opacity: isActive ? 0.9 : 0.25,
                          transform: isActive ? 'translateX(1px)' : 'none',
                          color: isActive ? '#FFFFFF' : '#64748B',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Feature Spotlight Mini Card */}
        <div style={{ padding: '0 12px', marginTop: 10 }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={11} color="#E2E8F0" />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#F1F5F9' }}>
                FormFlow Engine
              </span>
            </div>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
              Deep space architecture with real-time webhooks & conditional logic.
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Card & Sign Out */}
      <div
        style={{
          padding: '14px 14px 10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(2, 3, 6, 0.6)',
        }}
      >
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {userInitial}
                </div>
              )}
              {/* Online pulse badge */}
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '2px solid #020306',
                }}
              />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#F8FAFC',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#94A3B8',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayEmail}
              </div>
            </div>
          </div>

          {isGoogle && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#E2E8F0',
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 9999,
              }}
            >
              <ShieldCheck size={11} color="#10B981" />
              <span>Google Verified</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 9,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#F87171',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: signingOut ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: signingOut ? 0.7 : 1,
          }}
          className="sidebar-signout-btn"
        >
          <LogOut size={14} />
          <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

        <div
          style={{
            marginTop: 10,
            textAlign: 'center',
            fontSize: 10,
            color: '#64748B',
            letterSpacing: '0.01em',
          }}
        >
          FormFlow • by team trojen
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header with EXACT Landing Page Logo */}
      <div
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(2, 3, 6, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="mobile-header"
      >
        <Link href="/" title="Return to Landing Page" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Layers size={16} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#FFFFFF', letterSpacing: '-0.02em' }}>FormFlow</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-ghost" style={{ padding: 6, color: '#FFFFFF' }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: 'rgba(2, 3, 6, 0.8)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className="mobile-sidebar"
        style={{
          display: 'none',
          position: 'fixed',
          top: 56,
          left: 0,
          bottom: 0,
          width: 275,
          zIndex: 50,
          background: 'rgba(2, 3, 6, 0.98)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          flexDirection: 'column',
          paddingTop: 16,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
        }}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="sidebar desktop-sidebar">
        {sidebarContent}
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-sidebar { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#020306', overflow: 'hidden' }}>
      {/* Exact deep space background & starfield matching landing page */}
      <LiveBackground />

      {/* Cosmic Depth Vignette (matching landing page) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background:
            'radial-gradient(ellipse 90% 75% at 50% 50%, transparent 40%, rgba(2, 3, 6, 0.75) 85%, #020306 100%)',
        }}
      />

      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 2 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px 36px', maxWidth: '100%', overflowX: 'hidden' }} className="dashboard-main">
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .dashboard-main {
            padding: 72px 16px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}

