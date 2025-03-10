
export type AdminUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export type AdminRole = {
  user_id: string;
  role: string;
  created_at: string;
};

export type Profile = {
  id: string;
  username: string;
};

// Type for Supabase Auth User
export type SupabaseUser = {
  id: string;
  email?: string;
};

// Type for Supabase Auth response
export type SupabaseAuthResponse = {
  users: SupabaseUser[];
};
