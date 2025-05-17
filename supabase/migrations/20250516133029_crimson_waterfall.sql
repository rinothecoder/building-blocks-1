/*
  # Add initial tags

  1. Changes
    - Adds initial set of tags for template categorization
    - Uses DO block to check for existing tags before insertion
    - Prevents duplicate tag names
*/

DO $$
DECLARE
  tag_names text[] := ARRAY['header', 'hero', 'services', 'testimonials', 'pricing', 'contact', 'team', 'portfolio', 'cta', 'blog', 'faq', 'footer'];
  tag_name text;
BEGIN
  FOREACH tag_name IN ARRAY tag_names
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.tags WHERE name = tag_name) THEN
      INSERT INTO public.tags (name) VALUES (tag_name);
    END IF;
  END LOOP;
END $$;