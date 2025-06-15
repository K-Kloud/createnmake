
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  const handlePrevious = () => {
    setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentImage(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  return (
    <div className="relative">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
        <img 
          src={images[currentImage]} 
          alt={productName} 
          className="object-cover w-full h-full" 
        />
      </div>
      
      {images.length > 1 && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 rounded-full" 
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 rounded-full" 
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          <div className="flex justify-center mt-2 space-x-2">
            {images.map((_, index) => (
              <Button 
                key={index}
                variant={index === currentImage ? "default" : "outline"}
                size="icon"
                className="w-2 h-2 rounded-full p-0 min-w-0"
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
