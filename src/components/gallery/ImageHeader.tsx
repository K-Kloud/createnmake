
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
  price?: string;
  isCreator?: boolean; // Add isCreator prop
  onPriceChange?: (newPrice: string) => void; // Add callback for price changes
}

export const ImageHeader = ({ 
  creator, 
  timeAgo, 
  imageUrl, 
  imageId, 
  price,
  isCreator,
  onPriceChange
}: ImageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <CreatorInfo 
        creator={creator} 
        timeAgo={timeAgo} 
        price={price} 
        isCreator={isCreator}
        onPriceChange={onPriceChange}
      />
      <ShareButton creator={creator} imageUrl={imageUrl} imageId={imageId} />
    </div>
  );
};
