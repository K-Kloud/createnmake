import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Image as ImageIcon, Zap } from 'lucide-react';
import { optimizeImage, validateImageFile, OptimizedImage } from '@/services/imageOptimization';

interface MultipleReferenceUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  optimizing?: boolean;
}

export const MultipleReferenceUpload: React.FC<MultipleReferenceUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 3,
  disabled = false,
  optimizing = false,
}) => {
  const { toast } = useToast();
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([]);

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles);
    const totalFiles = files.length + newFiles.length;

    if (totalFiles > maxFiles) {
      toast({
        variant: "destructive",
        title: "Too Many Files",
        description: `Maximum ${maxFiles} reference images allowed.`,
      });
      return;
    }

    // Validate all files
    const validationResults = newFiles.map(validateImageFile);
    const invalidFiles = validationResults.filter(result => !result.valid);

    if (invalidFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Invalid Files",
        description: invalidFiles[0].error,
      });
      return;
    }

    try {
      setOptimizationProgress(0);
      
      // Optimize images
      const optimizedResults: OptimizedImage[] = [];
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        
        try {
          const optimized = await optimizeImage(file, {
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 0.85,
            format: 'jpeg',
            enhanceQuality: true
          });
          
          optimizedResults.push(optimized);
          setOptimizationProgress(((i + 1) / newFiles.length) * 100);
          
        } catch (error) {
          console.error('Failed to optimize image:', error);
          // Use original file if optimization fails
          optimizedResults.push({
            file,
            originalSize: file.size,
            optimizedSize: file.size,
            dimensions: { width: 0, height: 0 },
            format: 'original'
          });
        }
      }

      setOptimizedImages(prev => [...prev, ...optimizedResults]);
      onFilesChange([...files, ...optimizedResults.map(r => r.file)]);

      toast({
        title: "Images Optimized",
        description: `${optimizedResults.length} reference images added and optimized.`,
      });

    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "Failed to process reference images.",
      });
    }
  }, [files, maxFiles, onFilesChange, toast]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setOptimizedImages(prev => prev.filter((_, i) => i !== index));
    onFilesChange(newFiles);
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-semantic-primary flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          Reference Images ({files.length}/{maxFiles})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => {
            if (disabled) return;
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files) {
                handleFileSelect(target.files);
              }
            };
            input.click();
          }}
        >
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">
            Drag & drop images here or click to browse
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            PNG, JPEG, WebP up to 10MB each
          </div>
        </div>

        {/* Optimization Progress */}
        {optimizationProgress > 0 && optimizationProgress < 100 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Optimizing images...
            </div>
            <Progress value={optimizationProgress} className="h-2" />
          </div>
        )}

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {files.map((file, index) => {
              const optimized = optimizedImages[index];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium truncate max-w-[150px]">
                        {file.name}
                      </div>
                      {optimized && (
                        <div className="text-xs text-muted-foreground">
                          {optimized.format !== 'original' && (
                            <>
                              {Math.round(optimized.originalSize / 1024)}KB → {Math.round(optimized.optimizedSize / 1024)}KB
                              {optimized.dimensions.width > 0 && (
                                <span className="ml-2">
                                  {optimized.dimensions.width}×{optimized.dimensions.height}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {files.length > 0 && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded-md">
            Images are automatically optimized for better generation results.
          </div>
        )}
      </CardContent>
    </Card>
  );
};