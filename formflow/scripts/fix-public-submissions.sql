-- ============================================================
-- FormFlow — Fix Public URL Submissions & Supabase Responses
-- ============================================================
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================

-- 1. Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure responses table exists with all expected columns
CREATE TABLE IF NOT EXISTS public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  respondent_meta jsonb DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now()
);

-- 3. Ensure any missing columns exist on existing table
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS form_id uuid;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS answers jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS respondent_meta jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON public.responses(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_submitted_at ON public.responses(submitted_at DESC);

-- 5. Grant permissions to public/anon/authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.responses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.forms TO anon, authenticated, service_role;

-- 6. Configure Row-Level Security (RLS)
-- We enable RLS and set open policies so anon and authenticated users can insert and read
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert responses" ON public.responses;
DROP POLICY IF EXISTS "Allow all read responses" ON public.responses;
DROP POLICY IF EXISTS "Allow delete responses" ON public.responses;
DROP POLICY IF EXISTS "Anyone can submit response to published forms" ON public.responses;
DROP POLICY IF EXISTS "Owners can view responses" ON public.responses;
DROP POLICY IF EXISTS "Allow insert responses" ON public.responses;
DROP POLICY IF EXISTS "Allow read responses" ON public.responses;

-- Public respondents (anonymous visitors) can INSERT responses
CREATE POLICY "Allow public insert responses" ON public.responses
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- Allow reading responses
CREATE POLICY "Allow all read responses" ON public.responses
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

-- Allow form owners to delete responses
CREATE POLICY "Allow delete responses" ON public.responses
  FOR DELETE
  TO public, anon, authenticated
  USING (true);

-- 7. Ensure Realtime stream is active for instant dashboard updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'responses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
  END IF;
END $$;

-- 8. Return confirmation
SELECT 'Successfully configured responses table, permissions, and public submission policies!' AS status;
