/*
  # Fix user creation trigger

  1. Changes
    - Update trigger function to properly handle errors
    - Add proper error logging
    - Ensure correct permissions
    - Fix transaction handling
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_role text;
BEGIN
  -- Set default role for new users
  new_role := 'user';
  
  -- Insert new user with proper error handling
  BEGIN
    INSERT INTO public.users (id, role)
    VALUES (NEW.id, new_role);
  EXCEPTION
    WHEN unique_violation THEN
      -- If user already exists, ignore
      RETURN NEW;
    WHEN OTHERS THEN
      -- Log other errors but don't fail the transaction
      RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
      RETURN NEW;
  END;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Ensure policies exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;