
import { useState } from "react";
import { usePriceEditing } from "./hooks/usePriceEditing";
import { useTranslation } from "react-i18next";

interface CreatorInfoProps {
  creator: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
  price?: string; 
  isCreator?: boolean;
  onPriceChange?: (newPrice: string) => void;
}

export const CreatorInfo = ({ 
  creator, 
  timeAgo, 
  price, 
  isCreator = false,
  onPriceChange 
}: CreatorInfoProps) => {
  const { t } = useTranslation('common');
  // Use a default avatar if none is provided
  const avatarSrc = creator?.avatar || '/placeholder.svg';
  const displayName = creator?.name || 'Anonymous';
  
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
            title={isCreator ? t('imageCard.clickToEditPrice') : ""}
          >
            {price}
          </span>
        )
      )}
    </div>
  );
};
