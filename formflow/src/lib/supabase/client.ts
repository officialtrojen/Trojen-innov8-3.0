// ============================================================
// FormFlow — Supabase Browser Client
// ============================================================

import { createBrowserClient } from '@supabase/ssr';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chyylpcpabvibeaojwod.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoeXlscGNwYWJ2aWJlYW9qd29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDk0MjgsImV4cCI6MjEwNjMyNTQyOH0.zxYmO3twI_Bm0vL0OHLU_-wpnglZr7_T-VrMCnc-xms';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}
