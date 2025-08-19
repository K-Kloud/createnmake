import React, { useCallback, useRef, useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, X, File, Image, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadDropzoneProps {
  bucket: string;
  accept?: string;
  maxFileSize?: number;
  multiple?: boolean;
  className?: string;
  onUpload?: (urls: string[]) => void;
  onRemove?: (url: string) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

interface UploadedFile {
  url: string;
  path: string;
  name: string;
  type: string;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  bucket,
  accept = 'image/*,.pdf,.doc,.docx,.txt',
  maxFileSize = 5 * 1024 * 1024,
  multiple = false,
  className,
  onUpload,
  onRemove,
  disabled = false,
  showPreview = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress, error } = useFileUpload({
    bucket,
    maxFileSize,
    allowedTypes: accept.split(',').map(type => type.trim()),
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    await handleFileUpload(files);
  }, [disabled]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFileUpload(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!multiple && files.length > 1) {
      files = files.slice(0, 1);
    }

    for (const file of files) {
      const url = await uploadFile(file);
      if (url) {
        const newFile: UploadedFile = {
          url,
          path: `${Date.now()}_${file.name}`,
          name: file.name,
          type: file.type,
        };

        setUploadedFiles(prev => multiple ? [...prev, newFile] : [newFile]);
        onUpload?.([url]);
      }
    }
  }, [uploadFile, multiple, onUpload]);

  const handleRemoveFile = useCallback((fileToRemove: UploadedFile) => {
    setUploadedFiles(prev => prev.filter(file => file.url !== fileToRemove.url));
    onRemove?.(fileToRemove.url);
  }, [onRemove]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragOver && 'border-primary bg-primary/5',
          !isDragOver && 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className={cn('w-8 h-8', isDragOver ? 'text-primary' : 'text-muted-foreground')} />
          
          <div className="text-sm">
            <span className="font-medium">
              {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
            </span>
            <p className="text-muted-foreground mt-1">
              {accept.includes('image') && 'Images, '}
              PDF, DOC, TXT files up to {Math.round(maxFileSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.url}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                {isImage(file.type) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded border"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center border rounded bg-background">
                    {getFileIcon(file.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {file.type}
                    </Badge>
                    <Check className="w-3 h-3 text-success" />
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveFile(file)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};