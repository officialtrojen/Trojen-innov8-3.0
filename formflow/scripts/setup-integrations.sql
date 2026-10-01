-- =========================================================================
-- FormFlow FR-6: Custom Webhook Integrations Setup
-- Run this in your Supabase SQL Editor if integrations table is not yet configured.
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'webhook',
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Ensure all columns exist in case table was created with partial schema
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS form_id uuid;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'webhook';
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS configuration jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT true;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3. Create index for fast query by form_id during submissions
CREATE INDEX IF NOT EXISTS idx_integrations_form_id ON public.integrations(form_id);

-- 4. Disable RLS on integrations to ensure zero-friction during hackathon evaluation
ALTER TABLE public.integrations DISABLE ROW LEVEL SECURITY;

-- Verification query
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'integrations';
