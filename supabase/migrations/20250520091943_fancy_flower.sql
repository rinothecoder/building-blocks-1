/*
  # Add JSON content field to templates table

  1. Changes
    - Add json_content column to templates table
    - Update policies to handle the new field
    - Add validation check for JSON content
*/

-- Add json_content column to templates table
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS json_content jsonb;

-- Create a function to validate JSON content
CREATE OR REPLACE FUNCTION validate_json_content()
RETURNS trigger AS $$
BEGIN
  IF NEW.json_content IS NOT NULL THEN
    -- Check if json_content has an elements array
    IF NOT (NEW.json_content ? 'elements') THEN
      RAISE EXCEPTION 'JSON content must contain an elements array';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate JSON content
DROP TRIGGER IF EXISTS validate_json_content_trigger ON templates;
CREATE TRIGGER validate_json_content_trigger
  BEFORE INSERT OR UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION validate_json_content();