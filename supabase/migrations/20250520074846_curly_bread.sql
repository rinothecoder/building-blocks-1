/*
  # Update template policies for public access

  1. Changes
    - Add public read access to templates table
    - Maintain existing policies for authenticated users
    - Ensure templates can be viewed without authentication
    - Keep write operations restricted to authenticated users

  2. Security
    - Enable public read access while maintaining security for modifications
    - Preserve existing policies for authenticated users
    - Ensure template creators can only modify their own templates
*/

-- Add policy for public read access to templates
CREATE POLICY "Allow public read access to templates"
  ON templates
  FOR SELECT
  TO public
  USING (true);

-- Add policy for public read access to template_tags
CREATE POLICY "Allow public read access to template_tags"
  ON template_tags
  FOR SELECT
  TO public
  USING (true);

-- Add policy for public read access to tags
CREATE POLICY "Allow public read access to tags"
  ON tags
  FOR SELECT
  TO public
  USING (true);