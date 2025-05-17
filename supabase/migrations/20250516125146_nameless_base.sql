/*
  # Update Admin Credentials

  1. Changes
    - Update admin email to 'rino-admin@example.com'
    - Update password to a more secure value
  
  2. Security
    - Uses secure password hashing
    - Maintains existing role and permissions
*/

DO $$
BEGIN
  -- Update admin credentials if the user exists
  UPDATE auth.users 
  SET 
    email = 'rino-admin@example.com',
    encrypted_password = crypt('X9k#mP2$vL5nQ8@j', gen_salt('bf')),
    updated_at = now()
  WHERE email = 'admin@example.com';

  -- Update any related records in the public.users table
  -- This ensures the admin role is maintained
  UPDATE users
  SET role = 'admin'
  WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 'rino-admin@example.com'
  );
END $$;