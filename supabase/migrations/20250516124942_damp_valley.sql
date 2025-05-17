/*
  # Verify and recreate admin user

  This migration will:
  1. Check if admin user exists
  2. Create the user if not present
  3. Ensure proper role assignment
*/

DO $$
BEGIN
  -- Only create user if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    -- Create the user in auth.users
    INSERT INTO auth.users (
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
  END IF;

  -- Ensure admin role is set
  INSERT INTO users (id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'admin@example.com'
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;