import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Adicione suas credenciais do Supabase aqui.
// Você pode encontrá-las em Project Settings > API no seu painel Supabase.
const SUPABASE_URL = 'https://vpiikialbucgdukruxly.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaWlraWFsYnVjZ2R1a3J1eGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Njk4NTAsImV4cCI6MjA3NzQ0NTg1MH0.M0wBfgN2Lw1v5auWoQmwSrbnaAeNOOL-QlM0T8yZi9o';

let supabaseClient: SupabaseClient | null = null;

/**
 * Gets a Supabase client instance.
 * The client is initialized once with the hardcoded credentials above.
 * Returns null if credentials are not provided.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  // If the client is already initialized, return it.
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // If credentials are not set, return null to enable demo mode.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('<') || SUPABASE_ANON_KEY.includes('<')) {
    return null;
  }

  // Create and cache the client for future calls.
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
};

/**
 * This function is no longer needed with static configuration but is kept
 * to avoid breaking imports if it was used elsewhere. It now does nothing.
 */
export const resetSupabaseClient = () => {
    supabaseClient = null;
};