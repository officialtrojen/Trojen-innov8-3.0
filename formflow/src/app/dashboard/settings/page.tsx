'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Upload, Camera, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.name) {
      setFullName(profile.name);
    } else if (user?.user_metadata?.name || user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.name || user.user_metadata.full_name);
    }
  }, [profile, user]);

  // Upload avatar file to Supabase Storage 'avatars' bucket
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WEBP, or GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image file exceeds 5MB. Please choose a smaller file.');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      let publicUrl = '';
      if (uploadError) {
        console.warn('Storage upload returned error, checking fallback:', uploadError);
        // If storage bucket isn't set up yet, gracefully fall back to base64 DataURL
        const reader = new FileReader();
        publicUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      } else {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      // 2. Persist avatar_url in public.profiles table
      await supabase.from('profiles').upsert({
        id: user.id,
        name: (fullName || profile?.name || user?.email?.split('@')[0] || 'User').trim(),
        email: user.email?.toLowerCase(),
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });

      // 3. Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      // 4. Refresh global auth context
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      setAvatarError(err?.message || 'Failed to upload avatar to Supabase Storage.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Remove avatar picture
  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const supabase = createClient();
      await supabase.from('profiles').upsert({
        id: user.id,
        name: (fullName || profile?.name || 'User').trim(),
        email: user.email?.toLowerCase(),
        avatar_url: null,
        updated_at: new Date().toISOString(),
      });

      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to remove avatar:', err);
      setAvatarError(err?.message || 'Failed to remove avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

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

      await supabase.auth.updateUser({
        data: { name: fullName.trim(), full_name: fullName.trim() },
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

  const currentAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

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
            
            {/* Avatar Row with Drag & Drop & Upload */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                  e.target.value = '';
                }}
              />

              {/* Interactive Avatar Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingAvatar(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingAvatar(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingAvatar(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingAvatar(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click or drag & drop to change avatar picture"
                style={{
                  position: 'relative',
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 700,
                  color: 'white',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isDraggingAvatar
                    ? '3px dashed #38BDF8'
                    : '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isDraggingAvatar
                    ? '0 0 0 4px rgba(56, 189, 248, 0.3), 0 8px 24px rgba(0,0,0,0.5)'
                    : '0 4px 16px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease',
                  transform: isDraggingAvatar ? 'scale(1.05)' : 'scale(1)',
                  flexShrink: 0,
                }}
              >
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  (fullName || profile?.email || user?.email || 'U').charAt(0).toUpperCase()
                )}

                {/* Hover overlay hint */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: uploadingAvatar || isDraggingAvatar ? 1 : 0,
                    transition: 'opacity 0.2s',
                    color: '#FFFFFF',
                  }}
                  onMouseEnter={(e) => {
                    if (!uploadingAvatar && !isDraggingAvatar) e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    if (!uploadingAvatar && !isDraggingAvatar) e.currentTarget.style.opacity = '0';
                  }}
                >
                  {uploadingAvatar ? (
                    <Loader2 size={20} className="animate-spin" style={{ color: '#38BDF8' }} />
                  ) : (
                    <>
                      <Camera size={18} />
                      <span style={{ fontSize: 9.5, fontWeight: 700, marginTop: 2 }}>Edit</span>
                    </>
                  )}
                </div>
              </div>

              {/* Avatar Metadata & Actions */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>
                  {profile?.name || fullName || 'User'}
                </div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, marginBottom: 12 }}>
                  {profile?.email || user?.email}
                </div>

                {/* Upload & Remove Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 8,
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818CF8',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Uploading to Supabase Storage...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Upload New Picture</span>
                      </>
                    )}
                  </button>

                  {currentAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '7px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 8,
                        background: 'transparent',
                        color: '#F87171',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
                  Drag & drop your photo or click to browse. PNG, JPG, or WEBP up to 5MB.
                </div>
              </div>
            </div>

            {avatarError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FCA5A5',
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                <AlertCircle size={16} />
                <span>{avatarError}</span>
              </div>
            )}

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
                <span style={{ fontSize: 13, color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={14} /> Profile & picture saved to database!
                </span>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={saving || uploadingAvatar}
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
