import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PortfolioImage {
  id: number;
  generatedImage: string;
  productImage: string;
  description: string;
}

interface PortfolioGridProps {
  items: PortfolioImage[];
  manufacturerName: string;
}

export const PortfolioGrid = ({ items, manufacturerName }: PortfolioGridProps) => {
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);

  return (
    <div className="grid grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-center">Generated Design</h3>
            <div 
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={item.generatedImage}
                alt="Generated design"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Click to expand</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-center">Made Product</h3>
            <div 
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={item.productImage}
                alt="Manufactured product"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Click to expand</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {item.description}
          </p>
        </div>
      ))}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{manufacturerName}'s Portfolio Item</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="grid grid-cols-2 gap-6 p-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Generated Design</h3>
                <div className="relative aspect-video">
                  <img
                    src={selectedImage.generatedImage}
                    alt="Generated design"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Made Product</h3>
                <div className="relative aspect-video">
                  <img
                    src={selectedImage.productImage}
                    alt="Manufactured product"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-center text-muted-foreground">
                  {selectedImage.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};