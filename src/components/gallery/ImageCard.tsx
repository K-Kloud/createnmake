import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Eye, Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Comments } from "./Comments";

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

  return (
    <Card className="overflow-hidden glass-card hover:scale-[1.02] transition-transform">
      <CardContent className="p-0">
        <img
          src={image.url}
          alt={image.prompt}
          className="w-full h-64 object-cover cursor-pointer"
          onClick={() => onView(image.id)}
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
                <ThumbsUp className="h-4 w-4" />
                <span>{image.likes}</span>
              </Button>
              <Button 
                variant={showComments ? "default" : "ghost"} 
                size="sm" 
                className="space-x-1"
                onClick={() => setShowComments(!showComments)}
              >
                <span>{image.comments.length}</span>
              </Button>
              <Button variant="ghost" size="sm" className="space-x-1">
                <Eye className="h-4 w-4" />
                <span>{image.views}</span>
              </Button>
            </div>
            <Button size="sm" className="space-x-1">
              <Package className="h-4 w-4" />
              <span>{image.produced}</span>
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
  );
};