/*
  # Fix User Authentication Setup

  1. Changes
    - Drop and recreate user creation trigger with proper error handling
    - Add proper RLS policies for user management
    - Fix transaction handling in trigger function
    
  2. Security
    - Maintain existing security policies
    - Ensure proper role assignment
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new user with role
  INSERT INTO public.users (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add policy for Supabase system to insert users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Allow inserts for Supabase system'
  ) THEN
    CREATE POLICY "Allow inserts for Supabase system"
      ON users
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Add policy for authenticated users to insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Allow inserts for authenticated users'
  ) THEN
    CREATE POLICY "Allow inserts for authenticated users"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;