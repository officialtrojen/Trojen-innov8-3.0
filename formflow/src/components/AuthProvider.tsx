'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { DBProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: DBProfile | null;
  session: Session | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: string | null }>;
  sendOtp: (email: string, shouldCreateUser?: boolean) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  verifyOtpAndSetPassword: (
    email: string,
    token: string,
    password?: string,
    name?: string
  ) => Promise<{ error: string | null }>;
  signUpWithPasswordAndSendOtp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: (targetPath?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data) {
        setProfile(data as DBProfile);
        return data as DBProfile;
      }
    } catch (err) {
      console.warn('Error fetching live profile from Supabase:', err);
    }
    return null;
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // onAuthStateChange fires immediately from local storage cache — no network wait
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Fallback: ensure loading is cleared even if no auth event fires
    const timeout = setTimeout(() => setLoading(false), 500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name } },
    });
    if (error) {
      const msg = error.message?.includes('Database error saving new user')
        ? 'Database trigger error in Supabase. Please run the SQL script in scripts/fix-database-error.sql in your Supabase Dashboard SQL Editor.'
        : error.message;
      return { error: msg, session: null };
    }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email: email.trim(),
      });
    }
    return { error: null, session: data?.session ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      return { error: error.message };
    }
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      // Immediately upsert into public.profiles table
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: data.user.email?.toLowerCase() || cleanEmail,
          updated_at: new Date().toISOString(),
        });
        await fetchProfile(data.user.id);
      } catch (profileErr) {
        console.warn('Profile sync on sign in error:', profileErr);
      }
    }
    return { error: null };
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const target = redirectTo || '/dashboard';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(target)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.url && typeof window !== 'undefined') {
        window.location.assign(data.url);
      }

      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Google OAuth failed to initialize' };
    }
  };

  const sendOtp = async (email: string, shouldCreateUser: boolean = false) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser,
        },
      });
      if (error) {
        if (
          error.message?.includes('Signups not allowed') ||
          error.message?.includes('User not found') ||
          error.message?.includes('signup')
        ) {
          return { error: 'No account found with this email. Please sign up first.' };
        }
        return { error: error.message };
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      // Fire both OTP types in PARALLEL — whichever succeeds wins, no sequential wait
      const [emailResult, signupResult] = await Promise.allSettled([
        supabase.auth.verifyOtp({ email: cleanEmail, token: token.trim(), type: 'email' }),
        supabase.auth.verifyOtp({ email: cleanEmail, token: token.trim(), type: 'signup' }),
      ]);

      let sessionData = null;
      let errorMsg: string | null = null;

      for (const result of [emailResult, signupResult]) {
        if (result.status === 'fulfilled' && !result.value.error && result.value.data?.session) {
          sessionData = result.value.data;
          break;
        }
        if (result.status === 'fulfilled' && result.value.error) {
          errorMsg = result.value.error.message;
        }
      }

      if (sessionData?.session) {
        setSession(sessionData.session);
        setUser(sessionData.user);

        // Ensure profile is synced into public.profiles
        if (sessionData.user) {
          try {
            await supabase.from('profiles').upsert({
              id: sessionData.user.id,
              name: sessionData.user.user_metadata?.name || sessionData.user.user_metadata?.full_name || cleanEmail.split('@')[0],
              email: sessionData.user.email?.toLowerCase() || cleanEmail,
              updated_at: new Date().toISOString(),
            });
            await fetchProfile(sessionData.user.id);
          } catch (profileErr) {
            console.warn('Profile sync on verifyOtp error:', profileErr);
          }
        }

        return { error: null };
      }
      return { error: errorMsg || 'Invalid or expired OTP code.' };
    } catch (e: any) {
      return { error: e.message || 'Failed to verify OTP' };
    }
  };

  const verifyOtpAndSetPassword = async (
    email: string,
    token: string,
    password?: string,
    name?: string
  ) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      // 1. Try verify with type: 'signup' first, then 'email'
      let { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token.trim(),
        type: 'signup',
      });

      if (error) {
        const retry = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: token.trim(),
          type: 'email',
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        return { error: error.message };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
      }

      // 2. Set password and metadata if provided
      if (password || name) {
        const updatePayload: { password?: string; data?: { name: string } } = {};
        if (password) updatePayload.password = password;
        if (name) updatePayload.data = { name };

        const { data: updated, error: updateErr } = await supabase.auth.updateUser(updatePayload);
        if (!updateErr && updated.user) {
          setUser(updated.user);
        }
      }

      // 3. Upsert user profile
      const activeUser = data?.user || (await supabase.auth.getUser()).data.user;
      if (activeUser) {
        await supabase.from('profiles').upsert({
          id: activeUser.id,
          name: name || activeUser.user_metadata?.name || '',
          email: activeUser.email || cleanEmail,
          updated_at: new Date().toISOString(),
        });
        await fetchProfile(activeUser.id);
      }

      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Verification failed' };
    }
  };

  // Register user in Supabase (password stored) + send OTP via Supabase — single call, no SMTP delay
  const signUpWithPasswordAndSendOtp = async (name: string, email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // Step 1: Create user with password (Supabase will send confirmation OTP email automatically)
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name: cleanName, full_name: cleanName }, emailRedirectTo: undefined },
      });
      if (error) {
        if (
          error.message?.includes('already registered') ||
          error.message?.includes('already in use') ||
          error.message?.includes('already exists')
        ) {
          return { error: 'An account with this email already exists. Please sign in instead.' };
        }
        const msg = error.message?.includes('Database error saving new user')
          ? 'Database trigger error in Supabase. Please run the SQL script in scripts/fix-database-error.sql in your Supabase Dashboard SQL Editor.'
          : error.message;
        return { error: msg };
      }

      // Step 2: Supabase GoTrue duplicate check:
      // When email confirmations are enabled, if the user ALREADY exists, Supabase returns
      // data.user with identities as an empty array: Array.isArray(identities) && identities.length === 0.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        // Backfill into public.profiles so the table remains in sync
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            updated_at: new Date().toISOString(),
          });
        } catch {}
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }

      // Step 3: Brand new user! Immediately write to public.profiles table
      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch (profileErr) {
          console.warn('Failed to upsert profile during signup:', profileErr);
        }
      }

      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Signup failed' };
    }
  };

  const signOut = async (targetPath: string = '/login') => {
    // 1. Immediately wipe React state
    setUser(null);
    setProfile(null);
    setSession(null);

    // 2. Synchronously wipe all auth tokens and cookies
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('supabase') || k.includes('auth'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // Instantly expire all cookies
        document.cookie.split(';').forEach((cookie) => {
          const name = cookie.split('=')[0]?.trim();
          if (name) {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
            document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
          }
        });
      } catch (err) {
        console.warn('Storage wipe error:', err);
      }
    }

    // 3. Clear Supabase client local session instantly without waiting for remote server round-trip
    supabase.auth.signOut({ scope: 'local' }).catch(() => {});

    // 4. Instant navigation without delay
    if (typeof window !== 'undefined') {
      window.location.replace(targetPath);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        refreshProfile,
        signUp,
        signIn,
        signInWithGoogle,
        sendOtp,
        verifyOtp,
        verifyOtpAndSetPassword,
        signUpWithPasswordAndSendOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
