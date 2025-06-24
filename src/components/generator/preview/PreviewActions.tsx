import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Heart, Share2, Wand2, Edit3 } from 'lucide-react';
import { ShareDialog } from '@/components/sharing/ShareDialog';
import { ImageEditDialog } from '@/components/editing/ImageEditDialog';
import { useComponentPreloading } from '@/hooks/useBundleOptimization';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PreviewActionsProps {
  imageUrl?: string;
  imageId?: number;
  prompt: string;
  onLike?: (imageId: number) => void;
  onImageEdited?: (newImageUrl: string, newImageId: number) => void;
}

export const PreviewActions: React.FC<PreviewActionsProps> = ({
  imageUrl,
  imageId,
  prompt,
  onLike,
  onImageEdited
}) => {
  const [inpaintingOpen, setInpaintingOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { preloadImageEdit, preloadShare } = useComponentPreloading();

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLike = () => {
    if (imageId && onLike) {
      onLike(imageId);
    }
  };

  return (
    <>
      <div className="flex justify-center gap-3 pt-4">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        
        {imageUrl && imageId && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditDialogOpen(true)}
              {...preloadImageEdit}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInpaintingOpen(true)}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              AI Edit
            </Button>
          </>
        )}
        
        <Button variant="outline" size="sm" onClick={handleLike}>
          <Heart className="mr-2 h-4 w-4" />
          Like
        </Button>
        
        {imageUrl && imageId && (
          <ShareDialog
            imageUrl={imageUrl}
            imageId={imageId}
            prompt={prompt}
          >
            <Button variant="outline" size="sm" {...preloadShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </ShareDialog>
        )}
      </div>

      {/* Lazy loaded dialogs */}
      {editDialogOpen && imageUrl && (
        <Suspense fallback={<LoadingSpinner />}>
          <ImageEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            imageUrl={imageUrl}
            onSave={(editedUrl) => {
              onImageEdited?.(editedUrl, imageId || 0);
            }}
          />
        </Suspense>
      )}

      {/* Keep existing inpainting dialog */}
      {imageUrl && imageId && (
        <InpaintingDialog
          open={inpaintingOpen}
          onOpenChange={setInpaintingOpen}
          imageUrl={imageUrl}
          imageId={imageId}
          onImageEdited={onImageEdited}
        />
      )}
    </>
  );
};
