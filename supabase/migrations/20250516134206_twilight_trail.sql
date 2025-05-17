/*
  # Add storage policies and update RLS

  1. Changes
    - Add storage bucket policies for thumbnails and templates
    - Update RLS policies for templates table to allow authenticated users to upload

  2. Security
    - Enable storage bucket policies
    - Add policies for authenticated users to upload files
    - Update templates table policies to allow authenticated users to insert
*/

-- Enable storage bucket policies
BEGIN;

-- Add policy for thumbnails bucket
CREATE POLICY "Allow authenticated users to upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public to view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- Add policy for templates bucket
CREATE POLICY "Allow authenticated users to upload templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'templates' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public to view templates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'templates');

-- Update templates table policies
CREATE POLICY "Allow authenticated users to insert templates"
ON public.templates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

COMMIT;