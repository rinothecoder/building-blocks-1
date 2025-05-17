/*
  # Template Management Schema

  1. New Tables
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `thumbnail_url` (text)
      - `template_url` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
    
    - `template_tags` (junction table)
      - `template_id` (uuid, references templates)
      - `tag_id` (uuid, references tags)
      - Primary key is (template_id, tag_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read access" ON tags
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin write access" ON tags
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  thumbnail_url text NOT NULL,
  template_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON templates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow admin write access" ON templates
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create template_tags junction table
CREATE TABLE IF NOT EXISTS template_tags (
  template_id uuid REFERENCES templates ON DELETE CASCADE,
  tag_id uuid REFERENCES tags ON DELETE CASCADE,
  PRIMARY KEY (template_id, tag_id)
);

ALTER TABLE template_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON template_tags
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow admin write access" ON template_tags
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');