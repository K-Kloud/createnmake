import { createClient } from '@supabase/supabase-js';

// When connected to Lovable's Supabase integration, these variables are automatically injected
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl);
  console.error('Supabase Anon Key:', supabaseAnonKey);
  throw new Error('Missing Supabase environment variables. Make sure you have connected your Supabase project in Lovable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);