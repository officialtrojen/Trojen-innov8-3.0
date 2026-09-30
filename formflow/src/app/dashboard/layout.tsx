'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  AlertCircle,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import LiveBackground from '@/components/LiveBackground';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_THEME, DEFAULT_SETTINGS } from '@/lib/types';
import FormalAlertModal from '@/components/ui/FormalAlertModal';

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
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formNameError, setFormNameError] = useState<string | null>(null);
  const [creatingForm, setCreatingForm] = useState(false);
  const [formalModalInfo, setFormalModalInfo] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'warning' | 'error' | 'info' | 'success';
    primaryActionText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    primaryActionText: 'Change Name',
  });

  const handleSignOut = () => {
    setSigningOut(true);
    signOut('/login');
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || creatingForm) return;

    const title = formName.trim();
    const description = formDesc.trim();
    setFormNameError(null);
    setCreatingForm(true);

    try {
      const supabase = createClient();
      let ownerId = user?.id;
      if (!ownerId) {
        const { data: authData } = await supabase.auth.getUser();
        ownerId = authData?.user?.id;
      }
      if (!ownerId) {
        let guestId = typeof window !== 'undefined' ? localStorage.getItem('formflow_guest_id') : null;
        if (!guestId) {
          guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
          if (typeof window !== 'undefined') localStorage.setItem('formflow_guest_id', guestId);
        }
        ownerId = guestId;
      }

      // Check if a form with the same name already exists for this user
      const { data: existingForm } = await supabase
        .from('forms')
        .select('id')
        .eq('owner_id', ownerId)
        .ilike('title', title)
        .maybeSingle();

      if (existingForm) {
        setFormalModalInfo({
          isOpen: true,
          title: 'Form Name Already Exists',
          message: `A form named "${title}" already exists in your account. Please choose a different name for your new form.`,
          type: 'warning',
          primaryActionText: 'Change Name',
        });
        setFormNameError(`A form named "${title}" already exists.`);
        setCreatingForm(false);
        return;
      }

      const freshSchema = {
        title,
        description,
        fields: [
          {
            id: 'q_' + Math.random().toString(36).substring(2, 8),
            type: 'short_text',
            label: 'What is your full name?',
            required: true,
            placeholder: 'Type your answer here...',
          },
        ],
        logic: [],
        theme: DEFAULT_THEME,
        settings: DEFAULT_SETTINGS,
      };

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20) + '-' + Math.random().toString(36).substring(2, 7);

      const { data, error } = await supabase
        .from('forms')
        .insert({
          owner_id: ownerId,
          title,
          description: description || null,
          schema: freshSchema,
          theme: DEFAULT_THEME,
          status: 'published',
          public_slug: slug,
        })
        .select('id, public_slug')
        .single();

      if (error) {
        console.error('Supabase form creation error:', error);
        if (error.message.includes('idx_forms_unique_owner_title') || error.message.includes('duplicate key')) {
          setFormalModalInfo({
            isOpen: true,
            title: 'Form Name Already Exists',
            message: `A form named "${title}" already exists in your account. Please choose a different name for your new form.`,
            type: 'warning',
            primaryActionText: 'Change Name',
          });
          setFormNameError(`A form named "${title}" already exists.`);
        } else {
          setFormalModalInfo({
            isOpen: true,
            title: 'Unable to Save Form',
            message: error.message || 'An error occurred while saving to Supabase.',
            type: 'error',
            primaryActionText: 'Close',
          });
        }
        setCreatingForm(false);
        return;
      } else if (data) {
        setCreateModalOpen(false);
        setFormName('');
        setFormDesc('');
        router.push(`/builder?id=${data.id}`);
        return;
      }
    } catch (err: any) {
      console.error('Form creation exception:', err);
      setFormalModalInfo({
        isOpen: true,
        title: 'Error Creating Form',
        message: err?.message || 'An unexpected error occurred while communicating with the database.',
        type: 'error',
        primaryActionText: 'Close',
      });
    } finally {
      setCreatingForm(false);
    }
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
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            setCreateModalOpen(true);
          }}
          className="create-form-btn-glow"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 9,
            background: '#FFFFFF',
            color: '#000000',
            border: '1px solid #FFFFFF',
            cursor: 'pointer',
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
        </button>
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
                Create New Form
              </h2>
            </div>

            <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Enter a name and description for your form before moving to the studio builder.
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
                  disabled={!formName.trim() || creatingForm}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: !formName.trim() || creatingForm ? 'not-allowed' : 'pointer',
                    opacity: !formName.trim() || creatingForm ? 0.7 : 1,
                  }}
                >
                  {creatingForm ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14 }} />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Create & Open Studio →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal Alert / Warning Modal */}
      <FormalAlertModal
        isOpen={formalModalInfo.isOpen}
        onClose={() => setFormalModalInfo((prev) => ({ ...prev, isOpen: false }))}
        title={formalModalInfo.title}
        message={formalModalInfo.message}
        type={formalModalInfo.type}
        primaryActionText={formalModalInfo.primaryActionText}
      />

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

