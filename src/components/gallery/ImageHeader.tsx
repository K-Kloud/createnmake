import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ImageHeaderProps {
  username?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export const ImageHeader = ({ username, avatarUrl, createdAt }: ImageHeaderProps) => {
  const timeAgo = createdAt instanceof Date && !isNaN(createdAt.getTime())
    ? formatDistanceToNow(createdAt, { addSuffix: true })
    : 'recently';

  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback>{username?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{username || 'Anonymous'}</span>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>
    </div>
  );
};