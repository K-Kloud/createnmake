import { useState } from "react";
import Image from "@/components/ui/image";
import { Card } from "@/components/ui/card";
import { ImageHeader } from "./ImageHeader";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { ImageActions } from "./ImageActions";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ImageCardProps {
  image: {
    id: string | number;
    url: string;
    prompt: string;
    user?: {
      username?: string;
      avatarUrl?: string;
    };
    createdAt: Date;
    metrics?: {
      like: number;
      comment: number;
      view: number;
    };
    hasLiked?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
}

export const ImageCard = ({ image, onLike, onComment }: ImageCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const { mutate: incrementViews } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('increment_views', { image_id: image.id });
      if (error) throw error;
    },
  });

  const handleImageClick = () => {
    setShowPreview(true);
    incrementViews();
  };

  const handleLike = () => {
    if (onLike) {
      onLike();
      toast({
        title: image.hasLiked ? "Removed from likes" : "Added to likes",
        description: image.hasLiked 
          ? "The image has been removed from your likes"
          : "The image has been added to your likes",
      });
    }
  };

  return (
    <Card className="overflow-hidden bg-card/30 hover:bg-card/40 transition-colors">
      <div className="p-4">
        <ImageHeader
          username={image.user?.username}
          avatarUrl={image.user?.avatarUrl}
          createdAt={image.createdAt}
        />
      </div>
      
      <div className="relative aspect-square cursor-pointer" onClick={handleImageClick}>
        <Image
          src={image.url}
          alt={image.prompt}
          className="object-cover"
          fill
        />
      </div>

      <div className="p-4">
        <ImagePreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          imageUrl={image.url}
          imageId={image.id}
        />
        <p className="text-sm text-gray-300 truncate">{image.prompt}</p>
        <ImageActions
          metrics={image.metrics || { like: 0, comment: 0, view: 0 }}
          hasLiked={image.hasLiked || false}
          onLike={handleLike}
          onComment={onComment || (() => {})}
          imageId={image.id}
        />
      </div>
    </Card>
  );
};