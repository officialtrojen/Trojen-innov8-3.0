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
  signInWithGoogle: () => Promise<{ error: string | null }>;
  sendOtp: (email: string) => Promise<{ error: string | null }>;
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
  signOut: () => Promise<void>;
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
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email: email.trim(),
      });
    }
    return { error: error?.message ?? null, session: data?.session ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      return { error: error?.message ?? null };
    } catch (e: any) {
      return { error: e.message || 'Google OAuth failed to initialize' };
    }
  };

  const sendOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });
      return { error: error?.message ?? null };
    } catch (e: any) {
      return { error: e.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      // First attempt type: 'email' (for signInWithOtp)
      let { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email',
      });

      // If that fails, attempt type: 'signup' (for confirmation after signUp)
      if (error) {
        const retry = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: token.trim(),
          type: 'signup',
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data?.session) {
        setSession(data.session);
        setUser(data.user);
      }
      return { error: error?.message ?? null };
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
      if (error) return { error: error.message };

      // Step 2: If user already existed (identities empty), fall back to signInWithOtp
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
        const { error: otpErr } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false },
        });
        return { error: otpErr?.message ?? null };
      }

      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Signup failed' };
    }
  };

  const signOut = async () => {
    // Clear local state immediately for instant UI feedback
    setUser(null);
    setSession(null);
    // Navigate away at once, sign out in background
    window.location.href = '/';
    supabase.auth.signOut().catch(() => {});
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
