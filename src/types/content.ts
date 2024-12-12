import { Json } from './auth'

export interface GeneratedContent {
  content_id: number
  user_id: string
  content_type: string
  content_data: Json
  created_at: string
}

export interface GeneratedImage {
  id: number
  user_id: string | null
  prompt: string
  item_type: string
  aspect_ratio: string
  image_url: string | null
  reference_image_url: string | null
  status: string
  created_at: string | null
  updated_at: string | null
  likes: number | null
  views: number | null
  title: string | null
  is_public: boolean | null
  tags: string[] | null
}