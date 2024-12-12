import { manufacturerCategories } from "@/data/manufacturerCategories";
import { manufacturers } from "@/data/manufacturers";
import { Icon } from "lucide-react";
import { iconMap } from "@/lib/iconMap";

export const CategoryList = ({
  onSelectCategory
}: {
  onSelectCategory: (category: string) => void;
}) => {
  const getCategoryCount = (categoryName: string) => {
    return manufacturers.filter(m => m.type === categoryName).length;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {manufacturerCategories.map((category) => {
        const IconComponent = iconMap[category.icon];
        const manufacturerCount = getCategoryCount(category.name);
        
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className="relative h-auto p-6 flex flex-col items-center gap-4 rounded-lg border border-border hover:bg-primary/5 transition-colors group"
          >
            {IconComponent && (
              <IconComponent className="w-16 h-16 text-primary transition-transform group-hover:scale-110" />
            )}
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
              <p className="text-sm font-medium">
                {manufacturerCount} {manufacturerCount === 1 ? 'Manufacturer' : 'Manufacturers'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};