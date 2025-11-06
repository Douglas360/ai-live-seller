import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpiikialbucgdukruxly.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaWlraWFsYnVjZ2R1a3J1eGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Njk4NTAsImV4cCI6MjA3NzQ0NTg1MH0.M0wBfgN2Lw1v5auWoQmwSrbnaAeNOOL-QlM0T8yZi9o';

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabaseClient = (): SupabaseClient => {
  return supabaseClient;
};
