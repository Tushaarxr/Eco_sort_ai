import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Database features will not work.');
}

// Create the base Supabase client
// Note: For authenticated requests with Clerk, use the useSupabase hook instead
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // We use Clerk for auth, not Supabase auth
        autoRefreshToken: false,
    },
});

// Export credentials for use in other modules
export { supabaseUrl, supabaseAnonKey };
