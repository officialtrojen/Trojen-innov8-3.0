'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // onAuthStateChange fires immediately from local storage cache — no network wait
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
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
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error?.message ?? null };
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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
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
      // Fire both OTP types in PARALLEL — whichever succeeds wins, no sequential wait
      const [emailResult, signupResult] = await Promise.allSettled([
        supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' }),
        supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'signup' }),
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
      // 1. Try verify with type: 'signup' first, then 'email'
      let { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'signup',
      });

      if (error) {
        const retry = await supabase.auth.verifyOtp({
          email: email.trim(),
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
          email: activeUser.email || email,
        });
      }

      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Verification failed' };
    }
  };

  // Register user in Supabase (password stored) + send OTP via Supabase — single call, no SMTP delay
  const signUpWithPasswordAndSendOtp = async (name: string, email: string, password: string) => {
    try {
      // Step 1: Create user with password (Supabase will send confirmation OTP email automatically)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name }, emailRedirectTo: undefined },
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

      // Step 2: If user already existed (identities empty), do NOT sign in, inform user they exist
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }

      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Signup failed' };
    }
  };

  const signOut = async (targetPath: string = '/login') => {
    // 1. Immediately wipe React state
    setUser(null);
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
        session,
        loading,
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
