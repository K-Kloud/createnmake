export interface VirtualTryOnSession {
  id: number;
  user_id: string;
  body_reference_url: string;
  generated_image_id: number | null;
  tryon_result_url: string | null;
  body_mask_data: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  settings: Record<string, any>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface TryOnSettings {
  fitAdjustment?: 'tight' | 'regular' | 'loose';
  preserveBackground?: boolean;
  enhanceQuality?: boolean;
}

export interface CreateTryOnSessionParams {
  bodyImageUrl: string;
  generatedImageId: number;
  settings?: TryOnSettings;
}

export interface GenerateTryOnParams {
  sessionId: number;
  bodyImageUrl: string;
  clothingImageUrl: string;
  settings?: TryOnSettings;
}

export interface BatchTryOnParams {
  bodyImageUrl: string;
  clothingImageUrls: string[];
  generatedImageIds: number[];
  settings?: TryOnSettings;
}

export interface BatchTryOnResult {
  sessionIds: number[];
  results: VirtualTryOnSession[];
  failedIndices: number[];
}
