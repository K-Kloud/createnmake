
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
