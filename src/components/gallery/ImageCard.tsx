
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Comments } from "./Comments";
import { ImageHeader } from "./ImageHeader";
import { ImageActions } from "./ImageActions";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { MakerSelectionDialog } from "./MakerSelectionDialog";
import { useImageCard } from "./hooks/useImageCard";
import { ImageZoom } from "./image-card/ImageZoom";
import { ImagePrompt } from "./image-card/ImagePrompt";

interface ImageCardProps {
  image: {
    id: number;
    url: string;
    prompt: string;
    likes: number;
    comments: any[];
    views: number;
    produced: number;
    creator: {
      name: string;
      avatar: string;
    };
    createdAt: Date;
    timeAgo: string;
    hasLiked: boolean;
    image_likes: { user_id: string }[];
    metrics?: {
      like: number;
      comment: number;
      view: number;
    };
    user_id: string;
    price?: string;
  };
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  onFullImageClick?: () => void;
}

export const ImageCard = ({ 
  image, 
  onLike, 
  onView, 
  onAddComment, 
  onAddReply,
  onFullImageClick 
}: ImageCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  
  const { 
    currentPrice, 
    currentUser, 
    isCreator, 
    handleImageClick,
    handleZoomIn,
    handleZoomOut,
    zoomLevel,
    handleMakeSelection,
    handlePriceChange
  } = useImageCard(image, onView);

  const openImagePreview = () => {
    if (onFullImageClick) {
      onFullImageClick();
    } else {
      setImageOpen(true);
      handleImageClick();
    }
  };

  // Handle double-click to like the image
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the single click handler
    onLike(image.id);
  };

  return (
    <>
      <Card className="overflow-hidden glass-card hover:scale-[1.02] transition-transform">
        <CardContent className="p-0">
          <ImageZoom 
            imageUrl={image.url}
            alt={image.prompt}
            onImageClick={openImagePreview}
            onDoubleClick={handleDoubleClick}
          />
          
          <div className="p-4 space-y-3">
            <ImageHeader 
              creator={image.creator} 
              timeAgo={image.timeAgo}
              imageUrl={image.url}
              imageId={image.id}
              price={currentPrice}
              isCreator={isCreator}
              onPriceChange={handlePriceChange}
            />
            
            <ImagePrompt 
              prompt={image.prompt}
              initialShowPrompt={showPrompt}
            />
            
            <ImageActions
              metrics={image.metrics || { like: 0, comment: 0, view: 0 }}
              hasLiked={image.hasLiked}
              onLike={() => onLike(image.id)}
              onCommentToggle={() => setShowComments(!showComments)}
              showComments={showComments}
              onMakeClick={() => setSelectionDialogOpen(true)}
            />
            
            {showComments && (
              <Comments
                imageId={image.id}
                comments={image.comments}
                onAddComment={onAddComment}
                onAddReply={onAddReply}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {!onFullImageClick && (
        <ImagePreviewDialog
          open={imageOpen}
          onOpenChange={setImageOpen}
          imageUrl={image.url}
          prompt={image.prompt}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          imageId={image.id}
          userId={image.user_id}
          showPrompt={showPrompt}
        />
      )}

      <MakerSelectionDialog
        open={selectionDialogOpen}
        onOpenChange={setSelectionDialogOpen}
        onMakerSelect={handleMakeSelection}
      />
    </>
  );
};
