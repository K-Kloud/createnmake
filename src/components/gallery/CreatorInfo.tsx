
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface CreatorInfoProps {
  creator: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
  price?: string; // Optional price prop
  isCreator?: boolean; // Add prop to check if the current user is the creator
  onPriceChange?: (newPrice: string) => void; // Add callback for price changes
}

export const CreatorInfo = ({ 
  creator, 
  timeAgo, 
  price, 
  isCreator = false,
  onPriceChange 
}: CreatorInfoProps) => {
  // Use a default avatar if none is provided
  const avatarSrc = creator?.avatar || '/placeholder.svg';
  const displayName = creator?.name || 'Anonymous';
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(price || "");
  const { toast } = useToast();

  const handlePriceClick = () => {
    if (isCreator) {
      setIsEditing(true);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPrice(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedPrice && onPriceChange) {
      // Validate price format (£ followed by numbers)
      if (/^£\d+$/.test(editedPrice)) {
        onPriceChange(editedPrice);
      } else {
        toast({
          title: "Invalid price format",
          description: "Price should be in format £XX",
          variant: "destructive",
        });
        setEditedPrice(price || "");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedPrice(price || "");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <img
        src={avatarSrc}
        alt={displayName}
        className="w-6 h-6 rounded-full"
      />
      <span className="text-sm font-medium">{displayName}</span>
      <span className="text-sm text-gray-400">{timeAgo}</span>
      {price && (
        isEditing ? (
          <Input
            value={editedPrice}
            onChange={handlePriceChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="max-w-20 h-6 px-2 py-0 text-sm"
          />
        ) : (
          <span 
            className={`text-sm font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full ${isCreator ? 'cursor-pointer hover:bg-emerald-200' : ''}`}
            onClick={handlePriceClick}
            title={isCreator ? "Click to edit price" : ""}
          >
            {price}
          </span>
        )
      )}
    </div>
  );
};
