/*
  # Create Admin User

  1. Changes
    - Creates a new admin user with secure credentials
    - Sets up appropriate role and permissions

  2. Security
    - Uses secure password hashing
    - Sets admin role in users table
*/

DO $$
BEGIN
  -- Create the user in auth.users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'rino-admin@example.com'
  ) THEN
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
      'rino-admin@example.com',
      crypt('X9k#mP2$vL5nQ8@j', gen_salt('bf')),
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
  WHERE email = 'rino-admin@example.com'
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;