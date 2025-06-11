
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLikeImage } from "@/components/marketplace/hooks/useLikeImage";
import { useCommentImage } from "@/components/marketplace/hooks/useCommentImage";
import { supabase } from "@/integrations/supabase/client";
import { GalleryImage } from "@/types/gallery";
import { useTranslation } from "react-i18next";

interface UseImprovedImageGalleryProps {
  showUserImagesOnly?: boolean;
  images?: GalleryImage[];
  onLike?: (imageId: number) => void;
  onView?: (imageId: number) => void;
  onAddComment?: (imageId: number, comment: string) => void;
  onAddReply?: (imageId: number, commentId: number, reply: string) => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const useImprovedImageGallery = ({
  showUserImagesOnly = false,
  images: propImages,
  onLike: propOnLike,
  onView: propOnView,
  onAddComment: propOnAddComment,
  onAddReply: propOnAddReply,
  isLoading: propIsLoading,
  error: propError,
  onRetry: propOnRetry
}: UseImprovedImageGalleryProps) => {
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
        hasLiked: false,
        userId: session.user.id
      });
      
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
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, metrics: { ...img.metrics, view: (img.metrics?.view || 0) + 1 } } : img
        )
      );
      
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

  const handleRetry = () => {
    if (propOnRetry) {
      propOnRetry();
    } else {
      setError(null);
      fetchImages();
    }
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    displayImages,
    displayLoading,
    displayError,
    handleLike,
    handleView,
    handleAddComment,
    handleAddReply,
    handleRetry,
    t
  };
};
