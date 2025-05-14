
import { useState } from "react";
import { CategoryCard } from "./CategoryCard";
import { ManufacturerCard } from "./ManufacturerCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { manufacturerCategories } from "@/data/manufacturerCategories";
import { getCategoryCount, getFilteredManufacturers } from "@/utils/manufacturerUtils";
import { Scissors, Footprints, Printer, Gem, Briefcase, Armchair } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const iconMap: Record<string, any> = {
  Scissors,
  Footprints,
  Printer,
  Gem,
  Briefcase,
  Armchair,
};

export const ManufacturerCategoriesGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const filteredManufacturers = getFilteredManufacturers(selectedCategory);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {manufacturerCategories.map((category) => {
          const IconComponent = iconMap[category.icon];
          return (
            <CategoryCard
              key={category.id}
              name={category.name}
              description={category.description}
              icon={IconComponent}
              image={categoryImages[category.name] || ""}
              count={getCategoryCount(category.name)}
              onClick={() => {
                setSelectedCategory(category.name);
                setDialogOpen(true);
              }}
            />
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-full p-4' : 'max-w-4xl'} max-h-[80vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedCategory} Manufacturers</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4">
            {filteredManufacturers.map((manufacturer) => (
              <ManufacturerCard
                key={manufacturer.id}
                {...manufacturer}
                reviewCount={manufacturer.reviews.length}
              />
            ))}
            {filteredManufacturers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No manufacturers found for this category.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const categoryImages = {
  "Tailor": "https://images.unsplash.com/photo-1452960962994-acf4fd70b632",
  "Cobbler": "https://images.unsplash.com/photo-1449247709967-d4461a6a6103",
  "Printer": "https://images.unsplash.com/photo-1485833077593-4278bba3f11f",
  "Goldsmith": "https://images.unsplash.com/photo-1441057206919-63d19fac2369",
  "Leather Worker": "https://images.unsplash.com/photo-1469041797191-50ace28483c3",
  "Furniture Maker": "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2",
};
