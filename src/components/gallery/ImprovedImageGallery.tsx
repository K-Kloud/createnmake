import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { ImageCard } from "./ImageCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLikeImage } from "@/components/marketplace/hooks/useLikeImage";
import { useCommentImage } from "@/components/marketplace/hooks/useCommentImage";
import { supabase } from "@/integrations/supabase/client";
import { GalleryImage } from "@/types/gallery";
import { useTranslation } from "react-i18next";

interface ImprovedImageGalleryProps {
  onImageClick?: (image: GalleryImage) => void;
  showUserImagesOnly?: boolean;
}

export const ImprovedImageGallery = ({ 
  onImageClick, 
  showUserImagesOnly = false 
}: ImprovedImageGalleryProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('gallery');
  
  const { likeImage, isLiking } = useLikeImage();
  const { addComment, addReply } = useCommentImage();

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from<GalleryImage>('images')
        .select(`
          id, 
          url, 
          prompt, 
          likes, 
          comments, 
          views, 
          produced,
          creator:profiles (name, avatar),
          createdAt,
          timeAgo,
          user_id,
          price,
          image_likes(user_id)
        `)
        .order('createdAt', { ascending: false })
        .limit(30);

      if (showUserImagesOnly && session?.user) {
        query = query.eq('user_id', session.user.id);
      }
      
      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        const enrichedImages = data.map(img => ({
          ...img,
          hasLiked: img.image_likes.length > 0,
          metrics: {
            like: img.likes,
            comment: img.comments?.length || 0,
            view: img.views,
          },
        }));
        setImages(enrichedImages);
      } else {
        setImages([]);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch images:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user, showUserImagesOnly]);

  const handleLike = async (imageId: number) => {
    if (!session?.user) {
      toast({
        title: t('imageCard:signInRequired'),
        description: t('imageCard:signInToLike'),
        variant: "destructive",
      });
      return;
    }

    if (isLiking) return;

    try {
      const newLikeState = await likeImage(imageId);
      
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, hasLiked: newLikeState, metrics: { ...img.metrics, like: (img.metrics?.like || 0) + (newLikeState ? 1 : -1) } } : img
        )
      );
    } catch (err: any) {
      console.error("Like image failed:", err.message);
      toast({
        title: t('status:error'),
        description: "Failed to like image: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleView = async (imageId: number) => {
    try {
      // Optimistically update the view count locally
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, metrics: { ...img.metrics, view: (img.metrics?.view || 0) + 1 } } : img
        )
      );
      
      // Call the Supabase function to increment the view count
      const { error } = await supabase.functions.invoke('increment-image-view', {
        body: { image_id: imageId },
      });
  
      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error("View increment failed:", err.message);
      toast({
        title: t('status:error'),
        description: "Failed to update view count: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (imageId: number, commentText: string) => {
    if (!session?.user) {
      toast({
        title: t('imageCard:signInRequired'),
        description: t('imageCard:signInToLike'),
        variant: "destructive",
      });
      return;
    }

    try {
      const newComment = await addComment(imageId, commentText);
      
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { 
            ...img, 
            comments: [...(img.comments || []), newComment],
            metrics: { ...img.metrics, comment: (img.metrics?.comment || 0) + 1 }
          } : img
        )
      );
    } catch (err: any) {
      console.error("Add comment failed:", err.message);
      toast({
        title: t('status:error'),
        description: "Failed to add comment: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async (imageId: number, commentId: number, replyText: string) => {
    if (!session?.user) {
      toast({
        title: t('imageCard:signInRequired'),
        description: t('imageCard:signInToLike'),
        variant: "destructive",
      });
      return;
    }

    try {
      const newReply = await addReply(commentId, replyText);
      
      setImages(prevImages =>
        prevImages.map(img => {
          if (img.id === imageId) {
            return {
              ...img,
              comments: img.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, replies: [...(comment.replies || []), newReply] }
                  : comment
              ),
            };
          }
          return img;
        })
      );
    } catch (err: any) {
      console.error("Add reply failed:", err.message);
      toast({
        title: t('status:error'),
        description: "Failed to add reply: " + err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleRetry = () => {
    setError(null);
    fetchImages();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <WifiOff className="h-16 w-16 text-gray-400" />
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{t('connectionProblem')}</h3>
          <p className="text-gray-600 max-w-md">{t('connectionDescription')}</p>
        </div>
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('buttons:tryAgain')}
        </Button>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Wifi className="h-16 w-16 text-gray-400" />
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{t('noImagesFound')}</h3>
          <p className="text-gray-600 max-w-md">{t('noImagesDescription')}</p>
        </div>
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('buttons:tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onLike={handleLike}
          onView={handleView}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onFullImageClick={onImageClick ? () => onImageClick(image) : undefined}
        />
      ))}
    </div>
  );
};
