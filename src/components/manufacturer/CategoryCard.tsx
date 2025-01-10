import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CategoryCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  image: string;
  count: number;
  onClick: () => void;
}

export const CategoryCard = ({
  name,
  description,
  icon: Icon,
  image,
  count,
  onClick,
}: CategoryCardProps) => {
  // Sample generated images for each category - in a real app, these would come from your database
  const sampleImages = [
    image,
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
  ];

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
    >
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {sampleImages.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video w-full">
                    <img
                      src={img}
                      alt={`${name} category image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {index === 0 && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {Icon && <Icon className="absolute bottom-4 right-4 w-8 h-8 text-white" />}
                      </>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <span className="inline-block mt-2 text-sm text-primary">
            {count} manufacturers available
          </span>
        </div>
      </CardContent>
    </Card>
  );
};