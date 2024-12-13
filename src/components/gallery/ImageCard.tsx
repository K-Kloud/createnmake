import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Package, MessageSquare, ZoomIn, ZoomOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Comments } from "./Comments";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

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
    hasLiked: boolean;
  };
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
}

export const ImageCard = ({ image, onLike, onView, onAddComment, onAddReply }: ImageCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSendToManufacturer = () => {
    localStorage.setItem('selectedManufacturerImage', JSON.stringify({
      url: image.url,
      prompt: image.prompt,
      id: image.id
    }));
    
    toast({
      title: "Image Selected for Manufacturing",
      description: "Redirecting to manufacturing options...",
    });

    navigate('/manufacturer');
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
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={image.creator.avatar}
                alt={image.creator.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm font-medium">{image.creator.name}</span>
              <span className="text-sm text-gray-400">
                {formatDistanceToNow(image.createdAt, { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-300">{image.prompt}</p>
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Button 
                  variant={image.hasLiked ? "default" : "ghost"} 
                  size="sm" 
                  className="space-x-1"
                  onClick={() => onLike(image.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${image.hasLiked ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                  <span>{image.likes}</span>
                </Button>
                <Button 
                  variant={showComments ? "default" : "ghost"} 
                  size="sm" 
                  className="space-x-1"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{image.comments.length}</span>
                </Button>
                <Button variant="ghost" size="sm" className="space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{image.views}</span>
                </Button>
              </div>
              <Button 
                size="sm" 
                className="space-x-1"
                onClick={handleSendToManufacturer}
              >
                <Package className="h-4 w-4" />
                <span>Make</span>
              </Button>
            </div>
            
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

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <div className="relative">
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full object-contain transition-transform duration-200 rounded-lg"
              style={{ transform: `scale(${zoomLevel})` }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};