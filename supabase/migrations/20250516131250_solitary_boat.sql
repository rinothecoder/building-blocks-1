/*
  # Create tags table and add initial data
  
  1. New Tables
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on tags table
    - Add policies for read/write access
    
  3. Data
    - Insert initial tag values
*/

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Add policies (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tags' 
    AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON tags
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tags' 
    AND policyname = 'Allow admin write access'
  ) THEN
    CREATE POLICY "Allow admin write access" ON tags
      FOR ALL TO authenticated
      USING (auth.jwt() ->> 'role' = 'admin')
      WITH CHECK (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;

-- Insert initial tags
INSERT INTO tags (name) 
VALUES 
  ('header'),
  ('hero'),
  ('video'),
  ('services'),
  ('grid'),
  ('icons'),
  ('testimonials'),
  ('carousel'),
  ('slider'),
  ('pricing'),
  ('table'),
  ('toggle'),
  ('contact'),
  ('form'),
  ('map'),
  ('team'),
  ('profiles'),
  ('portfolio'),
  ('gallery'),
  ('masonry'),
  ('cta'),
  ('parallax'),
  ('button'),
  ('blog'),
  ('filter'),
  ('faq'),
  ('accordion'),
  ('statistics'),
  ('counter'),
  ('numbers'),
  ('footer'),
  ('newsletter'),
  ('subscription')
ON CONFLICT (name) DO NOTHING;