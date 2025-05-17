/*
  # Create Initial Admin User

  1. Changes
    - Create admin user in auth.users
    - Set admin role in users table
    - Add RLS policy for user role access

  Note: Password will be 'admin123' (hashed)
*/

-- First, create the user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Then create a users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user'
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Insert admin role for the created user
INSERT INTO users (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@example.com';