
import { useState } from "react";
import { usePriceEditing } from "./hooks/usePriceEditing";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { getFallbackUsername } from "@/utils/usernameUtils";

interface CreatorInfoProps {
  creator: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
  price?: string; 
  isCreator?: boolean;
  onPriceChange?: (newPrice: string) => void;
  userId?: string; // Add userId to fetch profile data
}

export const CreatorInfo = ({ 
  creator, 
  timeAgo, 
  price, 
  isCreator = false,
  onPriceChange,
  userId
}: CreatorInfoProps) => {
  // Fetch creator profile data
  const { data: profile } = useCreatorProfile(userId);
  
  // Use a default avatar if none is provided
  const avatarSrc = profile?.avatar_url || creator?.avatar || '/placeholder.svg';
  
  // Use profile display name with fallback logic - prioritize display name, then username, then creator name
  const displayName = profile?.display_name || 
    profile?.username || 
    creator?.name || 
    getFallbackUsername(
      undefined, // email
      userId,    // userId  
      profile?.display_name, // displayName
      undefined, // firstName
      undefined  // lastName
    ) || 'Creator';
  
  const { 
    isEditing,
    editedPrice,
    handlePriceClick,
    handlePriceChange,
    handleBlur,
    handleKeyDown
  } = usePriceEditing(price, isCreator, onPriceChange);

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
          <input
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
