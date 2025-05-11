
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
  is_creator: boolean | null
  is_artisan: boolean | null
  address: string | null
  bio: string | null
  business_name: string | null
  business_type: string | null
  phone: string | null
  specialties: string[] | null
}

export interface AdminRole {
  id: number
  user_id: string
  role: string
  created_at: string
  updated_at: string
}
