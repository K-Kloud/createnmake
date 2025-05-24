import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
interface ItemTypePreviewsProps {
  selectedItem: string;
}
export const ItemTypePreviews = ({
  selectedItem
}: ItemTypePreviewsProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Map of item types to example images (these would be actual URLs in a real implementation)
  const itemPreviewMap: Record<string, string> = {
    tops: "https://via.placeholder.com/300x300?text=Tops+Example",
    bottoms: "https://via.placeholder.com/300x300?text=Bottoms+Example",
    dresses: "https://via.placeholder.com/300x300?text=Dresses+Example",
    outerwear: "https://via.placeholder.com/300x300?text=Outerwear+Example",
    accessories: "https://via.placeholder.com/300x300?text=Accessories+Example",
    shoes: "https://via.placeholder.com/300x300?text=Shoes+Example"
  };
  useEffect(() => {
    if (selectedItem && itemPreviewMap[selectedItem]) {
      setPreviewImage(itemPreviewMap[selectedItem]);
    } else {
      setPreviewImage(null);
    }
  }, [selectedItem]);
  if (!previewImage) return null;
  return <div className="mt-4 rounded-lg overflow-hidden relative">
      
      <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
        Example only
      </div>
    </div>;
};