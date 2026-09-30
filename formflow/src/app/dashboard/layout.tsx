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
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/forms', label: 'My Forms', icon: FileText },
  { href: '/dashboard/forms/new', label: 'Create Form', icon: PlusCircle },
  { href: '/dashboard/responses', label: 'Responses', icon: MessageSquare },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Webhook },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 2px 10px rgba(14, 165, 233, 0.3)',
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#F8FAFC', letterSpacing: '-0.01em' }}>FormFlow</span>
        </Link>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7, #4F46E5)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {(user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.user_metadata?.name || user?.user_metadata?.full_name || 'Creator'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || 'User'}
            </div>
          </div>
        </div>

        {(user?.app_metadata?.provider === 'google' ||
          (user?.app_metadata?.providers as string[] | undefined)?.includes('google')) && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, marginBottom: 10 }}>
            <span>✓ Google Verified</span>
          </div>
        )}

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', color: '#F87171', opacity: signingOut ? 0.7 : 1 }}
        >
          <LogOut size={16} /> {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 10, color: '#64748B' }}>
          © 2026 FormFlow. Built with ❤️ by team trojen
        </div>
      </div>
    </>
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
          width: 260,
          zIndex: 50,
          background: 'rgba(10, 16, 32, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          flexDirection: 'column',
          paddingTop: 16,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="sidebar desktop-sidebar" style={{ background: 'rgba(10, 16, 32, 0.95)', borderRight: '1px solid rgba(255, 255, 255, 0.07)' }}>
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
