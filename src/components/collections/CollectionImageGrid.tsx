import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CollectionImageGridProps {
  images: any[];
  selectedImages: Set<number>;
  onToggleSelect: (imageId: number) => void;
  onRemove: (imageId: number) => void;
}

export const CollectionImageGrid = ({
  images,
  selectedImages,
  onToggleSelect,
  onRemove,
}: CollectionImageGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => {
        const isSelected = selectedImages.has(image.id);
        return (
          <Card
            key={image.id}
            className={cn(
              'cursor-pointer transition-all',
              isSelected && 'ring-2 ring-primary'
            )}
            onClick={() => onToggleSelect(image.id)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted overflow-hidden rounded-t-lg group">
                <img
                  src={image.image_url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant={isSelected ? 'default' : 'secondary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(image.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(image.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm line-clamp-2">{image.prompt}</p>
                {image.item_type && (
                  <Badge variant="secondary" className="mt-2">
                    {image.item_type}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
