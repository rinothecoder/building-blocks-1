/*
  # Make template_url nullable

  This migration modifies the templates table to make the template_url column nullable,
  allowing templates to be created with only JSON content and no associated template file.

  1. Changes
    - Make template_url column nullable in templates table

  2. Reason
    - Support JSON-only templates where users can paste Elementor content directly
    - Allow templates without requiring an uploaded template file
*/

ALTER TABLE templates 
ALTER COLUMN template_url DROP NOT NULL;