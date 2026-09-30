'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
      {/* Brand Header */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <Link
          href="/dashboard"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 0',
          }}
        >
          {/* Logo Mark with glowing multi-stop gradient */}
          <div
            style={{
              position: 'relative',
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #A855F7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 18,
              boxShadow: '0 4px 16px rgba(14, 165, 233, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              flexShrink: 0,
            }}
          >
            F
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FormFlow
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 6,
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  letterSpacing: '0.04em',
                }}
              >
                v3.0 PRO
              </span>
            </div>
          </div>
        </Link>

        {/* Live Status indicator */}
        <div
          style={{
            marginTop: 10,
            padding: '4px 10px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#94A3B8' }}>
            <span className="sidebar-pulse-dot" />
            <span>Cloud Sync Active</span>
          </div>
          <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>v3.0</span>
        </div>
      </div>

      {/* Primary CTA - Create Form Button */}
      <div style={{ padding: '0 12px', marginBottom: 18 }}>
        <Link
          href="/dashboard/forms/new"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 11,
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.18) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.38)',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: '0 4px 20px -2px rgba(14, 165, 233, 0.25)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="create-form-btn-glow"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(14, 165, 233, 0.5)',
              }}
            >
              <PlusCircle size={14} color="#FFFFFF" />
            </div>
            <span>Create Form</span>
          </div>

          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Sparkles size={11} color="#38BDF8" />
            <span>AI Ready</span>
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
                                : item.badge.variant === 'cyan'
                                ? 'rgba(56, 189, 248, 0.15)'
                                : item.badge.variant === 'purple'
                                ? 'rgba(168, 85, 247, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color:
                              item.badge.variant === 'emerald'
                                ? '#34D399'
                                : item.badge.variant === 'cyan'
                                ? '#38BDF8'
                                : item.badge.variant === 'purple'
                                ? '#C084FC'
                                : '#FBBF24',
                            border: `1px solid ${
                              item.badge.variant === 'emerald'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : item.badge.variant === 'cyan'
                                ? 'rgba(56, 189, 248, 0.3)'
                                : item.badge.variant === 'purple'
                                ? 'rgba(168, 85, 247, 0.3)'
                                : 'rgba(245, 158, 11, 0.3)'
                            }`,
                          }}
                        >
                          {item.badge.text}
                        </span>
                      )}
                      <ChevronRight
                        size={13}
                        style={{
                          opacity: isActive ? 0.9 : 0.3,
                          transform: isActive ? 'translateX(1px)' : 'none',
                          color: isActive ? '#38BDF8' : '#64748B',
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
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={11} color="#38BDF8" />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#F1F5F9' }}>
                FormFlow Automation
              </span>
            </div>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
              Real-time webhook notifications & conditional branching enabled.
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Card & Sign Out */}
      <div
        style={{
          padding: '14px 14px 10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(4, 7, 18, 0.4)',
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
                    border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284C7, #4F46E5)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    border: '1.5px solid rgba(56, 189, 248, 0.3)',
                    boxShadow: '0 0 10px rgba(14, 165, 233, 0.25)',
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
                  border: '2px solid #080E1C',
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
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38BDF8',
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 9999,
              }}
            >
              <ShieldCheck size={11} />
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
          FormFlow v3.0 • by team trojen
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <div
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(10, 16, 32, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="mobile-header"
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
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
          <span style={{ fontWeight: 700, fontSize: 16, color: '#F8FAFC' }}>FormFlow</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-ghost" style={{ padding: 6 }}>
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
            background: 'rgba(2, 6, 18, 0.75)',
            backdropFilter: 'blur(4px)',
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
          background: 'linear-gradient(180deg, rgba(8, 14, 28, 0.98) 0%, rgba(5, 9, 20, 0.99) 100%)',
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
    <div style={{ position: 'relative', minHeight: '100vh', background: '#070C1A', overflow: 'hidden' }}>
      {/* Subtle modern ambient background gradient - distinct from landing's starfield */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: `
            radial-gradient(ellipse 75% 45% at 15% 0%, rgba(56, 189, 248, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 65% 40% at 85% 100%, rgba(99, 102, 241, 0.06) 0%, transparent 60%),
            #070C1A
          `,
        }}
      />
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px 32px', maxWidth: '100%', overflowX: 'hidden' }} className="dashboard-main">
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
