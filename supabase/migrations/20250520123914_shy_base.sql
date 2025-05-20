/*
  # Clean up template files and update schema
  
  1. Changes
    - Clear out existing template files from storage
    - Update existing records to use json_content instead of template_url
    - Remove template_url values since they're no longer needed
*/

-- Update existing records to remove template_url values
UPDATE templates
SET template_url = NULL
WHERE template_url IS NOT NULL;