import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
    >
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <img
            src={image}
            alt={`${name} category`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {Icon && <Icon className="absolute bottom-4 right-4 w-8 h-8 text-white" />}
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