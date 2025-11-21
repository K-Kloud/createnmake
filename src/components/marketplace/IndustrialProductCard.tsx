import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageCircle, ShoppingBag } from "lucide-react";
import { GalleryImage } from "@/types/gallery";
import { HangerIcon, FabricIcon, ScanIcon } from "@/components/ui/fashion-icons";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface IndustrialProductCardProps {
  product: GalleryImage;
  onLike: (id: number) => void;
  onView: (id: number) => void;
  onClick: (product: GalleryImage) => void;
}

export const IndustrialProductCard = ({
  product,
  onLike,
  onView,
  onClick,
}: IndustrialProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate a unique barcode-style ID
  const barcodeId = `DA-${product.id.toString().padStart(6, '0')}`;
  
  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-background/40 backdrop-blur-sm border-muted/30",
        "transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
        "cursor-pointer tech-border animate-fade-in",
        isHovered && "glow-effect"
      )}
      onMouseEnter={() => {
        setIsHovered(true);
        onView(product.id);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product)}
    >
      {/* Technical Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Badge variant="outline" className="text-[9px] font-mono bg-background/80 backdrop-blur border-primary/30">
              {barcodeId}
            </Badge>
            <div className="flex gap-1">
              <div className="h-1 w-8 bg-primary/60" />
              <div className="h-1 w-4 bg-primary/40" />
              <div className="h-1 w-6 bg-primary/20" />
            </div>
          </div>
          <ScanIcon className="w-5 h-5 text-primary/70" />
        </div>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/20">
        <img
          src={product.url}
          alt={product.prompt || "Product"}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        
        {/* Grid Overlay - visible on hover */}
        <div 
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            "bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]",
            "bg-[size:20px_20px]",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Technical Corners */}
        <div className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/60" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/60" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/60" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/60" />
        </div>
      </div>

      {/* Fabric DNA Panel - Hover Reveal */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/85 to-transparent",
          "transition-all duration-500 backdrop-blur-md",
          isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
      >
        <div className="space-y-3">
          {/* Technical Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-primary/70 font-mono">
              <FabricIcon className="w-3 h-3" />
              <span>FABRIC DNA</span>
            </div>
            <h3 className="text-sm font-medium text-foreground line-clamp-2">
              {product.prompt || "Untitled Design"}
            </h3>
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">
                {product.creator?.name?.[0] || "?"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {product.creator?.name || "Anonymous"}
            </span>
          </div>

          {/* Technical Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(product.id);
              }}
              className="flex flex-col items-center gap-1 hover:text-primary transition-colors"
            >
              <Heart className={cn(
                "w-3.5 h-3.5",
                product.hasLiked && "fill-current text-primary"
              )} />
              <span className="text-[10px] font-mono">{product.likes || 0}</span>
            </button>
            
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">{product.views || 0}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">{product.comments?.length || 0}</span>
            </div>
          </div>

          {/* Price & Action */}
          {product.price && (
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-mono">UNIT PRICE</div>
                <div className="text-lg font-bold text-primary font-mono">{product.price}</div>
              </div>
              <Button
                size="sm"
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(product);
                }}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs font-mono">ACQUIRE</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Static Footer - Always Visible */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent",
        "transition-opacity duration-500",
        isHovered ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex items-center justify-between">
          <HangerIcon className="w-4 h-4 text-primary/50" />
          {product.price && (
            <Badge variant="secondary" className="text-xs font-mono bg-background/80 backdrop-blur">
              {product.price}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
