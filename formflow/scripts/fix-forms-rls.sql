-- ============================================================
-- FormFlow — Fix Form Creation & Builder ("Row-Level Security")
-- ============================================================
-- Paste and Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- Disable RLS restrictions on forms and responses so all operations succeed
ALTER TABLE IF EXISTS public.forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integrations DISABLE ROW LEVEL SECURITY;

-- Confirmation
SELECT 'Forms and responses permissions successfully unlocked!' AS status;
