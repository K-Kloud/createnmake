
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Comments } from "./Comments";
import { ImageHeader } from "./ImageHeader";
import { ImageActions } from "./ImageActions";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { MakerSelectionDialog } from "./MakerSelectionDialog";
import { generateRandomPrice } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useImageCard } from "./hooks/useImageCard";
import { Eye, EyeOff, MaximizeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <div 
            className="relative group cursor-pointer" 
            onClick={openImagePreview}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-2 transform transition-transform duration-200 group-hover:scale-110">
                <MaximizeIcon size={18} /> View full image
              </span>
            </div>
          </div>
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
            <div className="flex items-center justify-between">
              <p className={`text-sm text-gray-300 ${showPrompt ? 'truncate' : 'hidden'}`}>{image.prompt}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowPrompt(!showPrompt)}
                className="ml-2"
              >
                {showPrompt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPrompt ? 'Hide' : 'Show'} Prompt</span>
              </Button>
            </div>
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
