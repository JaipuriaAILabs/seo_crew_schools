import { createClient } from '@supabase/supabase-js';

/**
 * Initialize a Supabase client for interacting with the Supabase backend.
 *
 * @constant {string} supabaseUrl - The URL of the Supabase instance, retrieved from environment variables.
 * @constant {string} supabaseAnonKey - The anonymous key for accessing the Supabase instance, retrieved from environment variables.
 * @constant {Object} supabase - The Supabase client instance configured with authentication options.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true, // Persist user session in local storage
        autoRefreshToken: true, // Automatically refresh the token
        detectSessionInUrl: false, // Disable session detection from URL
        storage: window.localStorage, // Use local storage for session management
        storageKey: 'seo-crew-auth-token', // Key for storing the session token
        flowType: 'pkce' // Use PKCE flow for enhanced security
    }
});
