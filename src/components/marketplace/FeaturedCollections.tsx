
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";
import { useMarketplaceImages } from "./hooks/useMarketplaceImages";
import { useSession } from "@supabase/auth-helpers-react";

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
  const [autoPlay, setAutoPlay] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const session = useSession();
  const { data: marketplaceImages, isLoading } = useMarketplaceImages(session?.user?.id);
  
  // Create featured collections from marketplace images
  const collections: Collection[] = (marketplaceImages || []).slice(0, 3).map(image => ({
    id: image.id,
    title: image.prompt ? (image.prompt.length > 40 ? image.prompt.substring(0, 40) + '...' : image.prompt) : "Featured Design",
    description: `By ${image.creator.name}`,
    imageUrl: image.url,
    itemCount: image.likes + image.views,
    category: "design"
  }));

  // Fallback collections if no marketplace images are available
  const fallbackCollections: Collection[] = [
    {
      id: 1,
      title: "Summer Fashion",
      description: "Trendy designs for the summer season",
      imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      itemCount: 24,
      category: "fashion"
    },
    {
      id: 2,
      title: "Modern Furniture",
      description: "Contemporary home furnishing designs",
      imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      itemCount: 18,
      category: "furniture"
    },
    {
      id: 3,
      title: "Minimalist Accessories",
      description: "Clean and simple accessory designs",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      itemCount: 15,
      category: "accessories"
    }
  ];

  // Use marketplace images if available, otherwise use fallback collections
  const displayedCollections = collections.length > 0 ? collections : fallbackCollections;

  const handleCollectionClick = (id: number, category: string) => {
    navigate(`/marketplace?category=${category}&collection=${id}`);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;
    
    const intervalId = setInterval(() => {
      setActiveIndex((current) => (current + 1) % displayedCollections.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [autoPlay, displayedCollections.length]);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">Featured Collections</h2>
      
      {/* Loading state */}
      {isLoading && (
        <div className="h-64 sm:h-80 md:h-96 w-full flex items-center justify-center bg-muted rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Main Carousel */}
      {!isLoading && (
        <div className="relative mb-8">
          <Carousel className="w-full" setApi={(api) => {
            if (api) {
              api.on('select', () => {
                setActiveIndex(api.selectedScrollSnap());
              });
            }
          }}>
            <CarouselContent>
              {displayedCollections.map((collection) => (
                <CarouselItem key={collection.id} className="cursor-pointer">
                  <div 
                    className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-lg transition-all duration-300 transform hover:scale-[1.01]"
                    onClick={() => handleCollectionClick(collection.id, collection.category)}
                  >
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={collection.imageUrl} 
                        alt={collection.title} 
                        className="w-full h-full object-cover transition-transform duration-5000 ease-in-out hover:scale-110"
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <Badge className="absolute top-2 right-2">
                      {collection.itemCount} interactions
                    </Badge>
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <h3 className="font-bold text-xl text-white mb-1">{collection.title}</h3>
                      <p className="text-white/90">{collection.description}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-black/30 hover:bg-black/50 border-none text-white" />
            <CarouselNext className="right-2 bg-black/30 hover:bg-black/50 border-none text-white" />
          </Carousel>

          {/* Indicator dots */}
          <div className="flex justify-center mt-4 gap-2">
            {displayedCollections.map((_, index) => (
              <button 
                key={index} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-primary scale-125' : 'bg-gray-400/50'
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid of smaller cards below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayedCollections.map(collection => (
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
                {collection.itemCount} interactions
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
