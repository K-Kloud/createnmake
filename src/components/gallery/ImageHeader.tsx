import { CreatorInfo } from "./CreatorInfo";
import { ShareButton } from "./ShareButton";

interface ImageHeaderProps {
  creator: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
  imageUrl?: string;
  imageId?: number;
}

export const ImageHeader = ({ creator, timeAgo, imageUrl, imageId }: ImageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <CreatorInfo creator={creator} timeAgo={timeAgo} />
      <ShareButton creator={creator} imageUrl={imageUrl} imageId={imageId} />
    </div>
  );
};