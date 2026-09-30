'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageSquare,
  Webhook,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import LiveBackground from '@/components/LiveBackground';

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

  const sidebarContent = (
    <>
      {/* Brand Logo Header */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
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
              fontWeight: 800,
              fontSize: 18,
              boxShadow: '0 2px 12px rgba(139, 92, 246, 0.45)',
            }}
          >
            F
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 19,
              color: '#FFFFFF',
              letterSpacing: '-0.3px',
            }}
          >
            FormFlow
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
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

      {/* User Card & Logout Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              {(user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.user_metadata?.name || user?.user_metadata?.full_name || 'Creator'}
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
              {user?.email || 'Authenticated User'}
            </div>
          </div>
        </div>

        {user?.app_metadata?.provider === 'google' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60A5FA',
              fontSize: 10.5,
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: 20,
              marginBottom: 10,
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            <span>✓ Google Verified</span>
          </div>
        )}

        <button
          onClick={signOut}
          className="btn btn-ghost btn-sm"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            color: '#F87171',
            borderRadius: 8,
            padding: '7px 10px',
            fontSize: 13,
          }}
        >
          <LogOut size={15} /> Sign Out
        </button>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 10.5, color: '#64748B' }}>
          &copy; 2026 FormFlow &bull; Built with ❤️ by team trojen
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
          background: 'rgba(10, 15, 30, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="mobile-header"
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>FormFlow</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn btn-ghost"
          style={{ padding: 6, color: '#FFFFFF' }}
        >
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
            background: 'rgba(0, 0, 0, 0.65)',
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
          background: 'rgba(10, 15, 30, 0.98)',
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
      <aside className="sidebar desktop-sidebar" style={{ background: 'rgba(10, 15, 30, 0.92)' }}>
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
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <>
      <LiveBackground />
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <main
          style={{ flex: 1, padding: '36px 36px', maxWidth: '100%', overflowX: 'hidden' }}
          className="dashboard-main"
        >
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
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
