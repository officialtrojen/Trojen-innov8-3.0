'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      setFullName(profile.name);
    } else if (user?.user_metadata?.name || user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.name || user.user_metadata.full_name);
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const supabase = createClient();
      await supabase.from('profiles').upsert({
        id: user.id,
        name: fullName.trim(),
        email: user.email?.toLowerCase(),
        updated_at: new Date().toISOString(),
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: 60, maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ color: '#94A3B8', fontSize: 16 }}>Manage your account, workspace preferences, and billing.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Profile Section */}
        <section>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F8FAFC', marginBottom: 16 }}>Profile Information</h3>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '16px', padding: '32px' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white', overflow: 'hidden' }}>
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (fullName || profile?.email || user?.email || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{profile?.name || fullName || 'User'}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{profile?.email || user?.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Email Address (Supabase Verified)</label>
                <input type="text" disabled value={profile?.email || user?.email || ''} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94A3B8' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              {saveSuccess && (
                <span style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>✓ Profile saved to database!</span>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>

        {/* Workspace Section */}
        <section>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F8FAFC', marginBottom: 16 }}>Workspace Settings</h3>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '16px', padding: '32px' }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Workspace Name</label>
                <input type="text" defaultValue="My Workspace" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
              <div>
                <h4 style={{ color: '#EF4444', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Danger Zone</h4>
                <p style={{ color: '#94A3B8', fontSize: 13 }}>Permanently delete your account and all data.</p>
              </div>
              <button style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Delete Account</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
