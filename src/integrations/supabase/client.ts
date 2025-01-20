import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igkiffajkpfwdfxwokwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2lmZmFqa3Bmd2RmeHdva3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0ODg0NzAsImV4cCI6MjAyMzA2NDQ3MH0.RK_cEW4YOm5l-EiKEFi_TXGkGgQnADJ_zEeRXbAz5HA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
  },
});