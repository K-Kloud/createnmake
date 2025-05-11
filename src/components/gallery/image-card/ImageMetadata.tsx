
import { Eye, Heart, MessageSquare } from "lucide-react";

interface ImageMetadataProps {
  likes: number;
  comments: number;
  views: number;
  className?: string;
}

export const ImageMetadata = ({
  likes,
  comments,
  views,
  className = ""
}: ImageMetadataProps) => {
  return (
    <div className={`flex gap-4 text-sm text-gray-400 ${className}`}>
      <div className="flex items-center gap-1">
        <Heart className="h-3.5 w-3.5" />
        <span>{likes}</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageSquare className="h-3.5 w-3.5" />
        <span>{comments}</span>
      </div>
      <div className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        <span>{views}</span>
      </div>
    </div>
  );
};
