import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  prompt: string;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  imageId?: number;
  userId?: string;
}

export const ImagePreviewDialog = ({
  open,
  onOpenChange,
  imageUrl,
  prompt,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  imageId,
  userId
}: ImagePreviewDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Get current user's session and check if they're an admin
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
        const { data: adminRoles } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!adminRoles);
      }
    };

    checkAdminStatus();
  }, [session]);

  const canDelete = isAdmin || (currentUserId && userId === currentUserId);

  const handleDelete = async () => {
    if (!imageId || !canDelete) {
      toast({
        title: "Error",
        description: "You don't have permission to delete this image",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);

      // First, get all comment IDs for this image
      const { data: commentIds, error: commentIdsError } = await supabase
        .from('comments')
        .select('id')
        .eq('image_id', imageId);

      if (commentIdsError) {
        console.error('Error fetching comment IDs:', commentIdsError);
        throw commentIdsError;
      }

      // Delete comment replies for all comments of this image
      if (commentIds && commentIds.length > 0) {
        const { error: repliesError } = await supabase
          .from('comment_replies')
          .delete()
          .in('comment_id', commentIds.map(c => c.id));

        if (repliesError) {
          console.error('Error deleting comment replies:', repliesError);
          throw repliesError;
        }
      }

      // Then, delete comments
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('image_id', imageId);

      if (commentsError) {
        console.error('Error deleting comments:', commentsError);
        throw commentsError;
      }

      // Next, delete related metrics
      const { error: metricsError } = await supabase
        .from('marketplace_metrics')
        .delete()
        .eq('image_id', imageId);

      if (metricsError) {
        console.error('Error deleting metrics:', metricsError);
        throw metricsError;
      }

      // Finally delete the image
      const { error: imageError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', userId);

      if (imageError) throw imageError;

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative">
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full object-contain transition-transform duration-200 rounded-lg"
            style={{ transform: `scale(${zoomLevel})` }}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onZoomOut}
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onZoomIn}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};