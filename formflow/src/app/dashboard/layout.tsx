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
import LiveBackground from '@/components/LiveBackground';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/forms', label: 'My Forms', icon: FileText },
  { href: '/dashboard/forms/new', label: 'Create Form', icon: PlusCircle },
  { href: '/dashboard/responses', label: 'Responses', icon: MessageSquare },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Webhook },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
              background: 'linear-gradient(135deg, #4F7C7A, #52796F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#263B3B' }}>FormFlow</span>
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
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(184,206,207,0.3)' }}>
        <div style={{ fontSize: 13, color: '#52796F', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
        <button
          onClick={signOut}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', color: '#e74c3c' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
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
          background: 'var(--card-bg)',
          borderBottom: '1px solid rgba(184,206,207,0.3)',
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
              background: 'linear-gradient(135deg, #4F7C7A, #52796F)',
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
          <span style={{ fontWeight: 700, fontSize: 16, color: '#263B3B' }}>FormFlow</span>
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
            background: 'rgba(38,59,59,0.3)',
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
          background: 'var(--card-bg)',
          borderRight: '1px solid rgba(184,206,207,0.3)',
          flexDirection: 'column',
          paddingTop: 16,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
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
