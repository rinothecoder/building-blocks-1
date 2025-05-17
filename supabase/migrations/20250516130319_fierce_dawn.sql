/*
  # Fix authentication setup

  1. Changes
    - Add missing auth schema configuration
    - Add trigger to handle new user creation
    - Add policy for user management
  
  2. Security
    - Enable RLS on users table
    - Add policies for user data access
*/

-- Create a secure trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add policies for user data access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own data'
    AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can read own data" 
    ON public.users
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);
  END IF;
END $$;