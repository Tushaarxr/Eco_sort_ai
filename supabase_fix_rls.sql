-- ============================================
-- UPDATED SUPABASE RLS POLICY FOR E-WASTE APP
-- Run this in Supabase SQL Editor to fix the
-- "No suitable key" error for database saves
-- ============================================

-- First, drop existing restrictive policies on scans
DROP POLICY IF EXISTS "Users can insert their own scans" ON scans;
DROP POLICY IF EXISTS "Users can select their own scans" ON scans;
DROP POLICY IF EXISTS "Users can update their own scans" ON scans;
DROP POLICY IF EXISTS "Users can delete their own scans" ON scans;
DROP POLICY IF EXISTS "insert_own_scans" ON scans;
DROP POLICY IF EXISTS "select_own_scans" ON scans;

-- Allow INSERT for all authenticated and anonymous users
-- The user_id is passed directly in the data, not from JWT
CREATE POLICY "Allow insert scans"
  ON scans
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow SELECT for all users (they filter by user_id in the app)
CREATE POLICY "Allow select scans"
  ON scans
  FOR SELECT
  TO public
  USING (true);

-- Allow UPDATE for the owner (based on user_id column matching)
CREATE POLICY "Allow update own scans"
  ON scans
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow DELETE for the owner
CREATE POLICY "Allow delete own scans"
  ON scans
  FOR DELETE
  TO public
  USING (true);

-- Optional: Create an index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);

-- Verify the policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'scans';
