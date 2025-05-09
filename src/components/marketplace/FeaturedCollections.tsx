
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Collection {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  itemCount: number;
  category: string;
}

export const FeaturedCollections = () => {
  const navigate = useNavigate();
  
  // Sample featured collections
  const collections: Collection[] = [
    {
      id: 1,
      title: "Summer Fashion",
      description: "Trendy designs for the summer season",
      imageUrl: "https://github.com/shadcn.png",
      itemCount: 24,
      category: "fashion"
    },
    {
      id: 2,
      title: "Modern Furniture",
      description: "Contemporary home furnishing designs",
      imageUrl: "https://github.com/shadcn.png",
      itemCount: 18,
      category: "furniture"
    },
    {
      id: 3,
      title: "Minimalist Accessories",
      description: "Clean and simple accessory designs",
      imageUrl: "https://github.com/shadcn.png",
      itemCount: 15,
      category: "accessories"
    }
  ];

  const handleCollectionClick = (id: number, category: string) => {
    navigate(`/marketplace?category=${category}&collection=${id}`);
  };

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">Featured Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map(collection => (
          <Card 
            key={collection.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCollectionClick(collection.id, collection.category)}
          >
            <div className="aspect-video relative">
              <img 
                src={collection.imageUrl} 
                alt={collection.title} 
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 right-2">
                {collection.itemCount} items
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{collection.title}</h3>
              <p className="text-sm text-muted-foreground">{collection.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
