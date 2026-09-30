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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check local storage for demo google session if offline
    const demoUser = typeof window !== 'undefined' ? localStorage.getItem('formflow_demo_user') : null;
    if (demoUser) {
      try {
        const parsed = JSON.parse(demoUser);
        setUser(parsed);
        setLoading(false);
        return;
      } catch (e) {}
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (!error) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase.from('profiles').upsert({
          id: newUser.id,
          name,
          email,
        });
      }
    }
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (isPlaceholder) {
      // In local demo mode, simulate direct Google verification
      const mockGoogleUser = {
        id: 'google-demo-user-123',
        app_metadata: { provider: 'google' },
        user_metadata: {
          name: 'Verified Google User',
          full_name: 'Verified Google User',
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
          email_verified: true,
        },
        aud: 'authenticated',
        email: 'user@gmail.com',
        created_at: new Date().toISOString(),
      } as unknown as User;

      localStorage.setItem('formflow_demo_user', JSON.stringify(mockGoogleUser));
      setUser(mockGoogleUser);
      return { error: null };
    }

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
  };

  const signOut = async () => {
    localStorage.removeItem('formflow_demo_user');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}
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
