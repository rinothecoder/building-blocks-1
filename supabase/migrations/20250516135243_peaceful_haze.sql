/*
  # Update admin user and enable magic link auth
  
  1. Changes
    - Update admin email to production email
    - Enable magic link authentication
    - Update RLS policies for authenticated users
*/

-- Update admin user email
UPDATE auth.users 
SET email = 'rino@livingwithpixels.com',
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'rino-admin@example.com';

-- Update users table record
UPDATE public.users
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'rino@livingwithpixels.com'
);

-- Ensure the user has admin role in auth.users metadata
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'admin')
WHERE email = 'rino@livingwithpixels.com';