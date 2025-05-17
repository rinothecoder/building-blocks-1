/*
  # Add template tags insert policy

  1. Security Changes
    - Add RLS policy to allow users to insert template tags for templates they own
    - Policy ensures users can only add tags to templates they created
*/

CREATE POLICY "Users can insert tags for their templates"
  ON template_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_id
      AND templates.created_by = auth.uid()
    )
  );