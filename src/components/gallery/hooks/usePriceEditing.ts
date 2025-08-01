
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const usePriceEditing = (
  initialPrice: string | undefined,
  isCreator: boolean,
  onPriceChange?: (newPrice: string) => void
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(initialPrice || "");
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
      // Validate price format (£ followed by numbers, allow decimals)
      if (/^£\d+(\.\d{1,2})?$/.test(editedPrice)) {
        onPriceChange(editedPrice);
      } else {
        toast({
          title: "Invalid price format",
          description: "Price should be in format £XX or £XX.XX",
          variant: "destructive",
        });
        setEditedPrice(initialPrice || "");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedPrice(initialPrice || "");
    }
  };

  return {
    isEditing,
    editedPrice,
    handlePriceClick,
    handlePriceChange,
    handleBlur,
    handleKeyDown
  };
};
