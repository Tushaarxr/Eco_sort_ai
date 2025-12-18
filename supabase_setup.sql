-- ============================================
-- SUPABASE SETUP FOR E-WASTE ASSISTANT
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- TABLE 1: SCANS (Stores scan results)
-- ============================================
CREATE TABLE IF NOT EXISTS scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- Clerk user ID (not Supabase auth)
  image_url TEXT,
  item_type TEXT,
  type TEXT,
  materials JSONB DEFAULT '[]'::jsonb,
  hazard_level TEXT,
  disposal_method TEXT,
  confidence TEXT,
  recycling_value TEXT,
  data_security_risk BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);

-- ============================================
-- TABLE 2: RECYCLING_CENTERS (Optional - for caching/custom centers)
-- ============================================
CREATE TABLE IF NOT EXISTS recycling_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accepts_items JSONB DEFAULT '[]'::jsonb,
  phone_number TEXT,
  website TEXT,
  operating_hours TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  accepts_data_devices BOOLEAN DEFAULT false,
  data_wiping_service BOOLEAN DEFAULT false,
  pickup_service BOOLEAN DEFAULT false,
  fees TEXT,
  active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for location queries (if PostGIS is enabled)
-- CREATE INDEX IF NOT EXISTS idx_recycling_centers_location ON recycling_centers USING GIST (
--   ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
-- );

-- ============================================
-- TABLE 3: USER_PREFERENCES (Optional - for app settings)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,  -- Clerk user ID
  notifications_enabled BOOLEAN DEFAULT true,
  location_tracking_enabled BOOLEAN DEFAULT true,
  preferred_distance_unit TEXT DEFAULT 'km',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Using Clerk JWT - the user_id is in request.jwt.claims.sub
-- ============================================

-- Enable RLS on all tables
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SCANS TABLE POLICIES
-- Users can only access their own scans
-- ============================================

-- Policy: Users can view their own scans
CREATE POLICY "Users can view own scans" ON scans
  FOR SELECT
  USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::json->>'sub',
      auth.jwt()->>'sub'
    )
  );

-- Policy: Users can insert their own scans
CREATE POLICY "Users can insert own scans" ON scans
  FOR INSERT
  WITH CHECK (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::json->>'sub',
      auth.jwt()->>'sub'
    )
  );

-- Policy: Users can update their own scans
CREATE POLICY "Users can update own scans" ON scans
  FOR UPDATE
  USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::json->>'sub',
      auth.jwt()->>'sub'
    )
  );

-- Policy: Users can delete their own scans
CREATE POLICY "Users can delete own scans" ON scans
  FOR DELETE
  USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::json->>'sub',
      auth.jwt()->>'sub'
    )
  );

-- ============================================
-- RECYCLING CENTERS POLICIES
-- Public read, admin write
-- ============================================

-- Policy: Anyone can view recycling centers
CREATE POLICY "Anyone can view recycling centers" ON recycling_centers
  FOR SELECT
  USING (active = true);

-- ============================================
-- USER PREFERENCES POLICIES
-- ============================================

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT
  USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::json->>'sub',
      auth.jwt()->>'sub'
    )
  );

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT
  WITH CHECK (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::json->>'sub',
      auth.jwt()->>'sub'
    )
  );

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE
  USING (
    user_id = coalesce(
      current_setting('request.jwt.claims', true)::json->>'sub',
      auth.jwt()->>'sub'
    )
  );

-- ============================================
-- SEED DATA: Sample Recycling Centers
-- ============================================
INSERT INTO recycling_centers (name, address, latitude, longitude, accepts_items, phone_number, website, operating_hours, active, verified)
VALUES 
  ('City E-Waste Center', '123 Green Street, Downtown', 28.6139, 77.2090, '["Electronics", "Batteries", "Computers", "Phones"]'::jsonb, '555-0123', 'https://example.com', '9 AM - 5 PM Mon-Sat', true, true),
  ('Tech Recyclers Inc.', '456 Tech Boulevard, Industrial Area', 28.6229, 77.2190, '["Computers", "Phones", "Appliances"]'::jsonb, '555-0124', 'https://example.com', '10 AM - 6 PM Mon-Fri', true, true),
  ('Green Earth Recycling', '789 Eco Lane, Suburb', 28.6039, 77.1990, '["Electronics", "Batteries", "Appliances", "Cables"]'::jsonb, '555-0125', 'https://example.com', '8 AM - 4 PM Mon-Sat', true, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- DONE! Now set up Storage Bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket called "scans"
-- 3. Set bucket to PUBLIC
-- 4. Add the following policy for uploads:
--    - Operation: INSERT
--    - Target roles: authenticated
--    - Policy: (bucket_id = 'scans')
-- ============================================
