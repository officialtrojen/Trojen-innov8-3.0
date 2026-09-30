// ============================================================
// FormFlow — Supabase Server Client
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chyylpcpabvibeaojwod.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoeXlscGNwYWJ2aWJlYW9qd29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDk0MjgsImV4cCI6MjEwNjMyNTQyOH0.zxYmO3twI_Bm0vL0OHLU_-wpnglZr7_T-VrMCnc-xms',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server component - can't set cookies
          }
        },
      },
    }
  );
}
