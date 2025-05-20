import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL');
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection and log debug information
(async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test templates table access
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('count')
      .single();
    
    if (templatesError) {
      console.error('Failed to access templates:', templatesError);
      
      // Log the error for debugging
      await supabase
        .from('debug_logs')
        .insert([{
          message: `Templates access error: ${templatesError.message}`,
        }]);
    } else {
      console.log('Successfully connected to Supabase');
      console.log('Templates count:', templates?.count);
    }
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    
    // Attempt to log the error
    try {
      await supabase
        .from('debug_logs')
        .insert([{
          message: `Connection test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        }]);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
})();

export { supabase };