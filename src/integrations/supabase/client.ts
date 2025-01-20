import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igkiffajkpfwdfxwokwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2lmZmFqa3Bmd2RmeHdva3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU3ODQ2NDAsImV4cCI6MjAyMTM2MDY0MH0.S2Gf5vAqjfyYd4GR_xKgpP-E9ZGVVKQTgXVWvE64QsY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      apikey: supabaseAnonKey
    }
  }
});