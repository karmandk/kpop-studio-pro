-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates the tables needed for per-user tier state and song cache.

CREATE TABLE user_tiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier_data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE user_song_caches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year text NOT NULL,
  songs jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year)
);

ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_song_caches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tiers"
  ON user_tiers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tiers"
  ON user_tiers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tiers"
  ON user_tiers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own songs"
  ON user_song_caches FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own songs"
  ON user_song_caches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own songs"
  ON user_song_caches FOR UPDATE USING (auth.uid() = user_id);
