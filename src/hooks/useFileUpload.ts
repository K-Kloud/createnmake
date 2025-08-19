import { useCallback, useState } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { supabase } from '@/integrations/supabase/client';

interface UseFileUploadOptions {
  bucket: string;
  allowedTypes?: string[];
  maxFileSize?: number; // in bytes
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (url: string, path: string) => void;
}

interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
  uploadedPath: string | null;
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const {
    bucket,
    allowedTypes = ['image/*', 'application/pdf', 'text/*'],
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    onUploadProgress,
    onUploadComplete,
  } = options;

  const { handleError } = useErrorHandler();
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
    uploadedPath: null,
  });

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize) {
      setState(prev => ({
        ...prev,
        error: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`
      }));
      return false;
    }

    // Check file type
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      setState(prev => ({
        ...prev,
        error: `File type not allowed. Supported types: ${allowedTypes.join(', ')}`
      }));
      return false;
    }

    return true;
  }, [allowedTypes, maxFileSize]);

  const uploadFile = useCallback(async (file: File, fileName?: string): Promise<string | null> => {
    if (!validateFile(file)) {
      return null;
    }

    setState({
      isUploading: true,
      progress: 0,
      error: null,
      uploadedUrl: null,
      uploadedPath: null,
    });

    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const finalFileName = fileName || `${timestamp}.${fileExt}`;
      const filePath = `${timestamp}_${finalFileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setState(prev => {
          const newProgress = Math.min(prev.progress + 10, 90);
          onUploadProgress?.(newProgress);
          return { ...prev, progress: newProgress };
        });
      }, 100);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      setState({
        isUploading: false,
        progress: 100,
        error: null,
        uploadedUrl: publicUrl,
        uploadedPath: filePath,
      });

      onUploadProgress?.(100);
      onUploadComplete?.(publicUrl, filePath);

      return publicUrl;
    } catch (error) {
      handleError(error, 'File upload failed');
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
      return null;
    }
  }, [bucket, validateFile, handleError, onUploadProgress, onUploadComplete]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        uploadedUrl: null,
        uploadedPath: null,
      }));

      return true;
    } catch (error) {
      handleError(error, 'File deletion failed');
      return false;
    }
  }, [bucket, handleError]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedUrl: null,
      uploadedPath: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    deleteFile,
    reset,
    validateFile,
  };
};