// ============================================================
// FormFlow — Google OAuth Callback Route Handler
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chyylpcpabvibeaojwod.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoeXlscGNwYWJ2aWJlYW9qd29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDk0MjgsImV4cCI6MjEwNjMyNTQyOH0.zxYmO3twI_Bm0vL0OHLU_-wpnglZr7_T-VrMCnc-xms';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  if (errorParam) {
    console.error('Google OAuth error from provider:', errorParam, errorDesc);
    const message = errorDesc || errorParam;
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  if (code) {
    const cookieStore = await cookies();

    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';
    const redirectUrl = isLocalEnv
      ? `${origin}${next}`
      : forwardedHost
      ? `https://${forwardedHost}${next}`
      : `${origin}${next}`;

    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component context
            }
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sync Google profile data (avatar, full name) to public.profiles
      if (data?.user) {
        try {
          const rawMeta = data.user.user_metadata || {};
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: rawMeta.full_name || rawMeta.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            avatar_url: rawMeta.avatar_url || rawMeta.picture || null,
            updated_at: new Date().toISOString(),
          });
        } catch (profileErr) {
          console.error('Failed to sync profile after Google OAuth:', profileErr);
        }
      }

      return response;
    } else {
      console.error('OAuth code exchange error:', error);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message || 'oauth_failed')}`
      );
    }
  }

  // Redirect to login on error or missing code
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
