// Enhanced type definitions for admin components
export interface AdminImage {
  id: number;
  title: string | null;
  prompt: string;
  image_url: string | null;
  user_id: string | null;
  likes: number | null;
  views: number | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  item_type: string;
  aspect_ratio: string;
  is_public: boolean | null;
  tags: string[] | null;
}

export interface AdminImageEditData {
  title: string;
  prompt: string;
  likes: number;
  views: number;
}

export interface PortfolioItem {
  id: number;
  manufacturer_id: string;
  description: string | null;
  generatedimage: string | null;
  productimage: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItemEditData {
  description: string;
  generatedimage: string;
  productimage: string;
}

export interface NewPortfolioItem {
  description: string;
  generatedImage: string;
  productImage: string;
}

export interface ContentBlock {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComponentConfig {
  id: string;
  name: string;
  type: 'ui' | 'layout' | 'content' | 'form';
  config: Record<string, unknown>;
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  target: '_self' | '_blank' | '_parent' | '_top';
  order: number;
  is_active: boolean;
  parent_id?: string;
  children?: NavigationItem[];
}

export interface MonitoringAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
}