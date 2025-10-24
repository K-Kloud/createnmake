import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Heart, Share2, Wand2 } from 'lucide-react';
import { InpaintingDialog } from '@/components/inpainting/InpaintingDialog';
import { AddToCollectionButton } from '@/components/collections/AddToCollectionButton';

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

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    
    try {
      await navigator.clipboard.writeText(imageUrl);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy image URL:', error);
    }
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
              onClick={() => setInpaintingOpen(true)}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Edit Image
            </Button>
            
            <AddToCollectionButton imageId={imageId} variant="outline" size="sm" />
          </>
        )}
        
        <Button variant="outline" size="sm" onClick={handleLike}>
          <Heart className="mr-2 h-4 w-4" />
          Like
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>

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
