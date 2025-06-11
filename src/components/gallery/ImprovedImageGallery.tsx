
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
  images?: GalleryImage[];
  onLike?: (imageId: number) => void;
  onView?: (imageId: number) => void;
  onAddComment?: (imageId: number, comment: string) => void;
  onAddReply?: (imageId: number, commentId: number, reply: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const ImprovedImageGallery = ({ 
  onImageClick, 
  showUserImagesOnly = false,
  images: propImages,
  onLike: propOnLike,
  onView: propOnView,
  onAddComment: propOnAddComment,
  onAddReply: propOnAddReply,
  onLoadMore,
  hasMore,
  isLoading: propIsLoading,
  error: propError,
  onRetry: propOnRetry
}: ImprovedImageGalleryProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('gallery');
  
  const likeMutation = useLikeImage();
  const { commentMutation, replyMutation } = useCommentImage();

  // Use props if provided, otherwise fetch internally
  const displayImages = propImages || images;
  const displayLoading = propIsLoading !== undefined ? propIsLoading : loading;
  const displayError = propError !== undefined ? propError?.message : error;

  const fetchImages = useCallback(async () => {
    if (propImages) return; // Don't fetch if images are provided via props
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('generated_images')
        .select(`
          id, 
          image_url, 
          prompt, 
          likes, 
          views, 
          created_at,
          user_id,
          price,
          profiles!user_id (
            username,
            avatar_url
          ),
          image_likes(user_id),
          comments(
            id,
            text,
            created_at,
            user_id,
            profiles!user_id (
              username,
              avatar_url
            ),
            comment_replies(
              id,
              text,
              created_at,
              user_id,
              profiles!user_id (
                username,
                avatar_url
              )
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(30);

      if (showUserImagesOnly && session?.user) {
        query = query.eq('user_id', session.user.id);
      }
      
      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        const enrichedImages: GalleryImage[] = data.map(img => {
          // Handle profiles - it comes as an array, take the first element
          const profile = Array.isArray(img.profiles) ? img.profiles[0] : img.profiles;
          
          return {
            id: img.id,
            url: img.image_url || '',
            prompt: img.prompt || '',
            likes: img.likes || 0,
            comments: img.comments?.map(comment => {
              const commentProfile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
              
              return {
                id: comment.id,
                text: comment.text,
                user: {
                  id: comment.user_id,
                  name: commentProfile?.username || 'Anonymous',
                  avatar: commentProfile?.avatar_url || '/placeholder.svg'
                },
                createdAt: new Date(comment.created_at),
                replies: comment.comment_replies?.map(reply => {
                  const replyProfile = Array.isArray(reply.profiles) ? reply.profiles[0] : reply.profiles;
                  
                  return {
                    id: reply.id,
                    text: reply.text,
                    user: {
                      id: reply.user_id,
                      name: replyProfile?.username || 'Anonymous',
                      avatar: replyProfile?.avatar_url || '/placeholder.svg'
                    },
                    createdAt: new Date(reply.created_at)
                  };
                }) || []
              };
            }) || [],
            views: img.views || 0,
            produced: 0,
            creator: {
              name: profile?.username || 'Anonymous',
              avatar: profile?.avatar_url || '/placeholder.svg'
            },
            createdAt: new Date(img.created_at),
            timeAgo: 'Just now',
            hasLiked: img.image_likes?.some(like => like.user_id === session?.user?.id) || false,
            image_likes: img.image_likes || [],
            metrics: {
              like: img.likes || 0,
              comment: img.comments?.length || 0,
              view: img.views || 0,
            },
            user_id: img.user_id,
            price: img.price
          };
        });
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
  }, [session?.user, showUserImagesOnly, propImages]);

  const handleLike = async (imageId: number) => {
    if (propOnLike) {
      propOnLike(imageId);
      return;
    }

    if (!session?.user) {
      toast({
        title: t('signInRequired'),
        description: t('signInToLike'),
        variant: "destructive",
      });
      return;
    }

    try {
      await likeMutation.mutateAsync({
        imageId,
        hasLiked: false, // This will be determined by the mutation
        userId: session.user.id
      });
      
      // Update local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId 
            ? { 
                ...img, 
                hasLiked: !img.hasLiked, 
                metrics: { 
                  ...img.metrics, 
                  like: img.hasLiked ? img.metrics.like - 1 : img.metrics.like + 1 
                } 
              } 
            : img
        )
      );
    } catch (err: any) {
      console.error("Like image failed:", err.message);
      toast({
        title: "Error",
        description: "Failed to like image: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleView = async (imageId: number) => {
    if (propOnView) {
      propOnView(imageId);
      return;
    }

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
        title: "Error",
        description: "Failed to update view count: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (imageId: number, commentText: string) => {
    if (propOnAddComment) {
      propOnAddComment(imageId, commentText);
      return;
    }

    if (!session?.user) {
      toast({
        title: t('signInRequired'),
        description: t('signInToLike'),
        variant: "destructive",
      });
      return;
    }

    try {
      await commentMutation.mutateAsync({
        imageId,
        text: commentText,
        userId: session.user.id
      });
      
      // Refresh images to get the new comment
      fetchImages();
    } catch (err: any) {
      console.error("Add comment failed:", err.message);
      toast({
        title: "Error",
        description: "Failed to add comment: " + err.message,
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async (imageId: number, commentId: number, replyText: string) => {
    if (propOnAddReply) {
      propOnAddReply(imageId, commentId, replyText);
      return;
    }

    if (!session?.user) {
      toast({
        title: t('signInRequired'),
        description: t('signInToLike'),
        variant: "destructive",
      });
      return;
    }

    try {
      await replyMutation.mutateAsync({
        commentId,
        text: replyText,
        userId: session.user.id
      });
      
      // Refresh images to get the new reply
      fetchImages();
    } catch (err: any) {
      console.error("Add reply failed:", err.message);
      toast({
        title: "Error",
        description: "Failed to add reply: " + err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleRetry = () => {
    if (propOnRetry) {
      propOnRetry();
    } else {
      setError(null);
      fetchImages();
    }
  };

  if (displayLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <WifiOff className="h-16 w-16 text-gray-400" />
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{t('connectionProblem')}</h3>
          <p className="text-gray-600 max-w-md">{t('connectionDescription')}</p>
        </div>
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  if (displayImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Wifi className="h-16 w-16 text-gray-400" />
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{t('noImagesFound')}</h3>
          <p className="text-gray-600 max-w-md">{t('noImagesDescription')}</p>
        </div>
        <Button onClick={handleRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayImages.map((image) => (
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
