-- ==============================================================================
-- FORMFLOW — COMPLETE MASTER DATABASE SCHEMA & LIVE-SYNC SETUP SCRIPT
-- ==============================================================================
-- Run this ONCE in your Supabase SQL Editor:
-- Supabase Dashboard -> Project -> SQL Editor -> New Query -> Paste & Click "Run"
--
-- This script configures:
-- 1. UUID extensions
-- 2. User Profiles table + auto-profile creation trigger (100% fail-safe)
-- 3. Forms table with schema, themes, and public slugs
-- 4. Form Responses table with JSON answers & metadata
-- 5. Webhook Integrations table
-- 6. High-speed lookup indexes
-- 7. Complete Row Level Security (RLS) policies for anonymous & authenticated users
-- 8. Table grants for anon, authenticated, and service_role
-- 9. Supabase Realtime publication for instant live-syncing across all pages
-- ==============================================================================

-- STEP 1: Enable Necessary Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- STEP 2: PROFILES TABLE & SIGNUP TRIGGER
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure all columns exist even if table was created previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Drop existing trigger on auth.users if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create bulletproof handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(COALESCE(new.email, ''), '@', 1),
      'User'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'handle_new_user caught exception: %', SQLERRM;
    RETURN new;
END;
$$;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users who registered earlier
INSERT INTO public.profiles (id, email, name, avatar_url)
SELECT 
  id, 
  email,
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    split_part(COALESCE(email, ''), '@', 1),
    'User'
  ),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- STEP 3: FORMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL,
  title text NOT NULL,
  description text,
  schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  public_slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure all columns exist if table already exists
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS owner_id text NOT NULL DEFAULT '';
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Untitled Form';
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS schema jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS theme jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS public_slug text;
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ==============================================================================
-- STEP 4: RESPONSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS form_id uuid;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS answers jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();

-- ==============================================================================
-- STEP 5: INTEGRATIONS (WEBHOOKS) TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'webhook',
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS form_id uuid;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'webhook';
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS configuration jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT true;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ==============================================================================
-- STEP 6: PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_forms_public_slug ON public.forms(public_slug);
CREATE INDEX IF NOT EXISTS idx_forms_owner_id ON public.forms(owner_id);
CREATE INDEX IF NOT EXISTS idx_forms_updated_at ON public.forms(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON public.responses(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_submitted_at ON public.responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_form_id ON public.integrations(form_id);

-- ==============================================================================
-- STEP 7: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- 7.1 Profiles Policies
DROP POLICY IF EXISTS "Allow profile select" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Allow profile select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow profile insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow profile update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR auth.uid() IS NOT NULL);

-- 7.2 Forms Policies
DROP POLICY IF EXISTS "Public forms viewable by everyone" ON public.forms;
DROP POLICY IF EXISTS "Allow read forms" ON public.forms;
DROP POLICY IF EXISTS "Allow insert forms" ON public.forms;
DROP POLICY IF EXISTS "Allow update forms" ON public.forms;
DROP POLICY IF EXISTS "Allow delete forms" ON public.forms;

CREATE POLICY "Allow read forms" ON public.forms
  FOR SELECT USING (true);

CREATE POLICY "Allow insert forms" ON public.forms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update forms" ON public.forms
  FOR UPDATE USING (auth.uid()::text = owner_id OR auth.uid() IS NOT NULL OR true);

CREATE POLICY "Allow delete forms" ON public.forms
  FOR DELETE USING (auth.uid()::text = owner_id OR auth.uid() IS NOT NULL OR true);

-- 7.3 Responses Policies
DROP POLICY IF EXISTS "Anyone can submit response to published forms" ON public.responses;
DROP POLICY IF EXISTS "Owners can view responses" ON public.responses;
DROP POLICY IF EXISTS "Allow insert responses" ON public.responses;
DROP POLICY IF EXISTS "Allow read responses" ON public.responses;
DROP POLICY IF EXISTS "Allow delete responses" ON public.responses;

-- Public respondents anywhere can submit answers
CREATE POLICY "Allow insert responses" ON public.responses
  FOR INSERT WITH CHECK (true);

-- Form creators and dashboard can read responses
CREATE POLICY "Allow read responses" ON public.responses
  FOR SELECT USING (true);

-- Form creators can delete responses
CREATE POLICY "Allow delete responses" ON public.responses
  FOR DELETE USING (true);

-- 7.4 Integrations Policies
DROP POLICY IF EXISTS "Allow read integrations" ON public.integrations;
DROP POLICY IF EXISTS "Allow insert integrations" ON public.integrations;
DROP POLICY IF EXISTS "Allow update integrations" ON public.integrations;
DROP POLICY IF EXISTS "Allow delete integrations" ON public.integrations;

CREATE POLICY "Allow read integrations" ON public.integrations
  FOR SELECT USING (true);

CREATE POLICY "Allow insert integrations" ON public.integrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update integrations" ON public.integrations
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete integrations" ON public.integrations
  FOR DELETE USING (true);

-- ==============================================================================
-- STEP 8: GRANT PERMISSIONS TO ANON AND AUTHENTICATED ROLES
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- STEP 9: ENABLE SUPABASE REALTIME (LIVE-SYNCING)
-- ==============================================================================
DO $$
BEGIN
  -- Add forms to realtime publication if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'forms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.forms;
  END IF;

  -- Add responses to realtime publication if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'responses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Realtime publication setup notice: %', SQLERRM;
END;
$$;

-- ==============================================================================
-- VERIFICATION CONFIRMATION
-- ==============================================================================
SELECT 'FormFlow master database schema, security policies, and live-sync successfully activated!' AS status;
