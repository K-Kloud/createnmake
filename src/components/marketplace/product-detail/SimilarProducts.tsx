
import { GalleryImage } from "@/types/gallery";

interface SimilarProductsProps {
  products: GalleryImage[];
}

export const SimilarProducts = ({ products }: SimilarProductsProps) => {
  if (products.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Similar Products</h4>
      <div className="grid grid-cols-2 gap-2">
        {products.slice(0, 4).map(item => (
          <div key={item.id} className="aspect-square rounded border cursor-pointer overflow-hidden">
            <img 
              src={item.url} 
              alt={item.prompt} 
              className="object-cover w-full h-full hover:scale-105 transition-transform" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};
