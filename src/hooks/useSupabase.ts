import { useAuth } from '@clerk/clerk-expo';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

// Get credentials from environment
// Note: In Expo, env vars prefixed with EXPO_PUBLIC_ are available at runtime
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

/**
 * Hook to get a Supabase client with Clerk JWT authentication
 * Use this hook in components that need authenticated database access
 */
export function useSupabase(): SupabaseClient {
    const { getToken } = useAuth();

    const client = useMemo(() => {
        return createClient(supabaseUrl, supabaseKey, {
            global: {
                // Intercept fetches to inject the Clerk JWT
                fetch: async (url, options = {}) => {
                    // Get Clerk token - template 'supabase' must be configured in Clerk dashboard
                    // If no template, use default token
                    let clerkToken = null;
                    try {
                        clerkToken = await getToken({ template: 'supabase' });
                    } catch {
                        // If supabase template doesn't exist, get default token
                        clerkToken = await getToken();
                    }

                    const headers = new Headers(options?.headers);

                    if (clerkToken) {
                        headers.set('Authorization', `Bearer ${clerkToken}`);
                    }

                    return fetch(url, {
                        ...options,
                        headers,
                    });
                },
            },
            auth: {
                persistSession: false, // Clerk handles session persistence
                autoRefreshToken: false,
            }
        });
    }, [getToken]);

    return client;
}

// Export a basic client for non-authenticated operations (like fetching public data)
export function getPublicSupabaseClient(): SupabaseClient {
    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
}
