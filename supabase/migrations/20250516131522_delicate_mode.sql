/*
  # Add initial tags

  1. Changes
    - Insert initial tags into the tags table
    - Each tag will have a unique UUID and timestamp
    - Includes all tags used in the frontend templates
*/

-- Insert initial tags if they don't exist
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