import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMarketplaceImages } from "./hooks/useMarketplaceImages";
import { useSession } from "@supabase/auth-helpers-react";
import { DataPointIcon, GridOverlayIcon } from "@/components/ui/fashion-icons";
import { ChevronLeft, ChevronRight, Eye, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Collection {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  itemCount: number;
  category: string;
  views?: number;
  likes?: number;
}

export const TechnicalFeaturedCollections = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const session = useSession();
  const { data: marketplaceImages, isLoading } = useMarketplaceImages(session?.user?.id);
  
  const collections: Collection[] = (marketplaceImages || []).slice(0, 4).map(image => ({
    id: image.id,
    title: image.prompt ? (image.prompt.length > 50 ? image.prompt.substring(0, 50) + '...' : image.prompt) : "Featured Asset",
    description: `Creator: ${image.creator.name}`,
    imageUrl: image.url,
    itemCount: image.likes + image.views,
    category: "design",
    views: image.views,
    likes: image.likes,
  }));

  const fallbackCollections: Collection[] = [
    {
      id: 1,
      title: "Neural Fashion Collection",
      description: "AI-generated couture designs",
      imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      itemCount: 24,
      category: "fashion",
      views: 1240,
      likes: 89,
    },
    {
      id: 2,
      title: "Quantum Textile Series",
      description: "Advanced material simulations",
      imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      itemCount: 18,
      category: "furniture",
      views: 980,
      likes: 67,
    },
    {
      id: 3,
      title: "Digital Craftsmanship",
      description: "Precision-engineered accessories",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      itemCount: 15,
      category: "accessories",
      views: 756,
      likes: 54,
    },
  ];

  const displayedCollections = collections.length > 0 ? collections : fallbackCollections;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((current) => (current + 1) % displayedCollections.length);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [displayedCollections.length]);

  const handlePrevious = () => {
    setActiveIndex((current) => 
      current === 0 ? displayedCollections.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % displayedCollections.length);
  };

  const handleCollectionClick = (id: number, category: string) => {
    navigate(`/marketplace?category=${category}&collection=${id}`);
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="h-[500px] bg-muted/20 rounded-lg animate-pulse tech-border" />
      </div>
    );
  }

  return (
    <div className="mb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <GridOverlayIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-mono gradient-text">FEATURED_COLLECTIONS</h2>
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            CURATED_ASSETS // HIGH_PERFORMANCE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            className="h-8 w-8 bg-background/50 border-primary/20 hover:border-primary/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="h-8 w-8 bg-background/50 border-primary/20 hover:border-primary/50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Featured Display */}
      <div className="relative h-[500px] rounded-lg overflow-hidden tech-border group">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0">
          <img
            src={displayedCollections[activeIndex].imageUrl}
            alt={displayedCollections[activeIndex].title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>

          {/* Scanline effect */}
          <div className="absolute inset-0 scanline" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-8">
          {/* Top Bar */}
          <div className="flex items-start justify-between">
            <Badge variant="outline" className="font-mono text-xs bg-background/80 backdrop-blur border-primary/30">
              COLLECTION_{String(activeIndex + 1).padStart(2, '0')}
            </Badge>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-background/80 backdrop-blur rounded border border-border/50 flex items-center gap-2">
                <Eye className="w-3 h-3 text-primary" />
                <span className="text-xs font-mono">{displayedCollections[activeIndex].views || displayedCollections[activeIndex].itemCount}</span>
              </div>
              <div className="px-3 py-1.5 bg-background/80 backdrop-blur rounded border border-border/50 flex items-center gap-2">
                <Heart className="w-3 h-3 text-primary" />
                <span className="text-xs font-mono">{displayedCollections[activeIndex].likes || Math.floor(displayedCollections[activeIndex].itemCount * 0.3)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2 mb-3">
                <div className="h-1 w-16 bg-primary/80" />
                <div className="h-1 w-12 bg-primary/60" />
                <div className="h-1 w-8 bg-primary/40" />
              </div>
              <h3 className="text-3xl font-bold text-foreground font-mono">
                {displayedCollections[activeIndex].title}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {displayedCollections[activeIndex].description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => handleCollectionClick(displayedCollections[activeIndex].id, displayedCollections[activeIndex].category)}
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 font-mono"
              >
                <DataPointIcon className="w-4 h-4 mr-2" />
                EXPLORE_COLLECTION
              </Button>
              <div className="text-xs font-mono text-muted-foreground">
                {displayedCollections[activeIndex].itemCount} ASSETS
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {displayedCollections.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                index === activeIndex 
                  ? "w-12 bg-primary" 
                  : "w-6 bg-primary/30 hover:bg-primary/50"
              )}
              aria-label={`Go to collection ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Grid of Additional Collections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayedCollections.slice(0, 3).map((collection, idx) => (
          <Card
            key={collection.id}
            onClick={() => handleCollectionClick(collection.id, collection.category)}
            className={cn(
              "group relative overflow-hidden cursor-pointer",
              "bg-background/40 backdrop-blur border-border/50",
              "transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            )}
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={collection.imageUrl}
                alt={collection.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              {/* Technical overlay */}
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="text-[9px] font-mono bg-background/80 backdrop-blur border-primary/30">
                  COL_{String(idx + 1).padStart(2, '0')}
                </Badge>
              </div>

              {/* Metrics */}
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="px-2 py-1 bg-background/80 backdrop-blur rounded text-[10px] font-mono flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" />
                  {collection.views || collection.itemCount}
                </div>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                  {collection.title}
                </h4>
                <p className="text-xs text-muted-foreground font-mono line-clamp-1">
                  {collection.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
