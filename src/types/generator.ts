// Enhanced generator types with strict typing
export interface GenerationParams {
  prompt: string;
  itemType: string;
  aspectRatio: string;
  referenceImageUrl: string | null;
}

export interface GenerationState {
  prompt: string;
  selectedItem: string;
  selectedRatio: string;
  previewOpen: boolean;
  referenceImage: File | null;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  authDialogOpen: boolean;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ReferenceImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface KeywordSuggestion {
  category: string;
  keywords: string[];
  description?: string;
}

export interface ClothingItem {
  value: string;
  label: string;
  category: string;
  description?: string;
}

export interface AspectRatio {
  value: string;
  label: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface GenerationError extends Error {
  code?: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
}

export interface GenerationMetrics {
  generationTime: number;
  promptLength: number;
  imageSize: number;
  modelUsed: string;
}