/*
  # Fix user trigger with proper permissions

  1. Changes
    - Remove direct table alterations that require owner privileges
    - Update trigger function to use proper security context
    - Ensure proper error handling in trigger function

  2. Security
    - Function runs with security definer to ensure proper permissions
    - Search path is explicitly set to avoid search path attacks
*/

-- Create or replace trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$;

-- Create trigger if it doesn't exist
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
END
$$;