/*
  # Fix user signup issues
  
  1. Changes
    - Add service_role policy for user table to allow system-level operations
    - Ensure proper RLS policies for user creation
    - Add debug logging to handle_new_user function
  
  2. Security
    - Maintain existing RLS
    - Add specific policies for service role operations
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow inserts for Supabase system" ON public.users;
DROP POLICY IF EXISTS "Allow inserts for authenticated users" ON public.users;

-- Recreate policies with proper permissions
CREATE POLICY "Enable full access for service role"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow inserts for authenticated users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Update handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (id) DO NOTHING;

  -- Insert a debug log entry
  INSERT INTO public.debug_logs (message, user_id)
  VALUES ('New user created successfully', new.id);

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the error details
  INSERT INTO public.debug_logs (message, user_id)
  VALUES (
    format('Error in handle_new_user: %s (SQLSTATE: %s)', SQLERRM, SQLSTATE),
    new.id
  );
  RAISE EXCEPTION '%', SQLERRM;
END;
$$ language plpgsql security definer;