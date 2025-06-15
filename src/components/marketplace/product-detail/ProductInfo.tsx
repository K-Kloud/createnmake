
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { GalleryImage } from "@/types/gallery";

interface ProductInfoProps {
  product: GalleryImage;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bold text-base text-slate-50">{product.prompt}</h2>
          <div className="flex items-center mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`h-4 w-4 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">4.0 (12 reviews)</span>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg">
          ${product.price}
        </Badge>
      </div>
    </div>
  );
};
