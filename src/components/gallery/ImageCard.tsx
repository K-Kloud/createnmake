
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
}

export const ImageCard = ({ image, onLike, onView, onAddComment, onAddReply }: ImageCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(image.price || generateRandomPrice(image.id));
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  useState(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUser(data.session.user.id);
      }
    };
    checkUser();
  });

  const isCreator = currentUser === image.user_id;

  const handleImageClick = () => {
    setImageOpen(true);
    onView(image.id);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleMakeSelection = (type: 'artisan' | 'manufacturer') => {
    localStorage.setItem('selectedDesignImage', JSON.stringify({
      url: image.url,
      prompt: image.prompt,
      id: image.id
    }));
    
    toast({
      title: "Design Selected",
      description: `Redirecting to ${type} selection...`,
    });

    setSelectionDialogOpen(false);
    navigate(type === 'artisan' ? '/artisan' : '/manufacturer');
  };

  const handlePriceChange = async (newPrice: string) => {
    setCurrentPrice(newPrice);
    
    toast({
      title: "Price Updated",
      description: `Price has been updated to ${newPrice}`,
    });
    
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ price: newPrice })
        .eq('id', image.id);
        
      if (error) {
        console.error('Error updating price:', error);
        toast({
          title: "Error",
          description: "Failed to update price in database",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Exception updating price:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="overflow-hidden glass-card hover:scale-[1.02] transition-transform">
        <CardContent className="p-0">
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full h-64 object-cover cursor-pointer"
            onClick={handleImageClick}
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
            <p className="text-sm text-gray-300 truncate">{image.prompt}</p>
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
      />

      <MakerSelectionDialog
        open={selectionDialogOpen}
        onOpenChange={setSelectionDialogOpen}
        onMakerSelect={handleMakeSelection}
      />
    </>
  );
};
