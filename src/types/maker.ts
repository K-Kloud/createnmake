
export interface Manufacturer {
  id: string;
  business_name: string;
  business_type: string;
  address?: string;
  phone?: string;
  contact_email: string;
  specialties?: string[];
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

export interface Artisan {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  is_artisan?: boolean;
  address?: string;
  bio?: string;
  business_name?: string;
  business_type?: string;
  phone?: string;
  specialties?: string[];
}

export type Maker = Manufacturer | Artisan;
