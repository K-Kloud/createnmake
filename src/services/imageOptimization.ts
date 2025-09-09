export interface OptimizationOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  enhanceQuality: boolean;
}

export interface OptimizedImage {
  file: File;
  originalSize: number;
  optimizedSize: number;
  dimensions: { width: number; height: number };
  format: string;
}

export const optimizeImage = async (
  file: File,
  options: OptimizationOptions = {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.85,
    format: 'jpeg',
    enhanceQuality: true
  }
): Promise<OptimizedImage> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate optimal dimensions
        const { width: newWidth, height: newHeight } = calculateOptimalDimensions(
          img.width,
          img.height,
          options.maxWidth,
          options.maxHeight
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Apply quality enhancement if requested
        if (options.enhanceQuality) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        // Draw and resize image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to optimized format
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to optimize image'));
              return;
            }

            const optimizedFile = new File(
              [blob],
              `optimized_${file.name}`,
              { type: `image/${options.format}` }
            );

            resolve({
              file: optimizedFile,
              originalSize: file.size,
              optimizedSize: blob.size,
              dimensions: { width: newWidth, height: newHeight },
              format: options.format
            });
          },
          `image/${options.format}`,
          options.quality
        );

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for optimization'));
    img.src = URL.createObjectURL(file);
  });
};

const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Scale down if too large
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please upload images smaller than 10MB.'
    };
  }

  return { valid: true };
};

export const batchOptimizeImages = async (
  files: File[],
  options?: OptimizationOptions
): Promise<OptimizedImage[]> => {
  const promises = files.map(file => optimizeImage(file, options));
  return Promise.all(promises);
};