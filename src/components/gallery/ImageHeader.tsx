import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageHeaderProps {
  creator: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
}

export const ImageHeader = ({ creator, timeAgo }: ImageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <img
          src={creator.avatar}
          alt={creator.name}
          className="w-6 h-6 rounded-full"
        />
        <span className="text-sm font-medium">{creator.name}</span>
        <span className="text-sm text-gray-400">{timeAgo}</span>
      </div>
      <Button variant="ghost" size="sm" className="p-1">
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};