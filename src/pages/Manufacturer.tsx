import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ManufacturerCard } from "@/components/manufacturer/ManufacturerCard";
import { manufacturers } from "@/data/manufacturers";
import { manufacturerCategories } from "@/data/manufacturerCategories";
import { 
  Scissors,
  Footprints,
  Printer,
  Gem,
  Briefcase,
  Armchair,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  Scissors,
  Footprints,
  Printer,
  Gem,
  Briefcase,
  Armchair,
};

const Manufacturer = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const selectedImage = localStorage.getItem('selectedManufacturerImage');
  const imageDetails = selectedImage ? JSON.parse(selectedImage) : null;

  const filteredManufacturers = selectedCategory
    ? manufacturers.filter(m => m.type === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-24">
        <h1 className="text-4xl font-bold mb-8 gradient-text">
          Manufacturing Categories
        </h1>
        
        {imageDetails && (
          <div className="mb-8 p-4 glass-card">
            <h2 className="text-xl font-semibold mb-4">Selected Design</h2>
            <div className="flex items-center gap-4">
              <img
                src={imageDetails.url}
                alt={imageDetails.prompt}
                className="w-32 h-32 object-cover rounded"
              />
              <div>
                <p className="text-sm text-muted-foreground">Design ID: {imageDetails.id}</p>
                <p className="mt-2">{imageDetails.prompt}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {manufacturerCategories.map((category) => {
            const IconComponent = iconMap[category.icon];
            return (
              <Button
                key={category.id}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-4 hover:bg-primary/5"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setDialogOpen(true);
                }}
              >
                {IconComponent && <IconComponent className="w-12 h-12" />}
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Button>
            );
          })}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCategory} Manufacturers</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-6 mt-4">
              {filteredManufacturers.map((manufacturer) => (
                <ManufacturerCard
                  key={manufacturer.id}
                  {...manufacturer}
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

        <h2 className="text-2xl font-semibold mb-6">All Manufacturers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {manufacturers.map((manufacturer) => (
            <ManufacturerCard
              key={manufacturer.id}
              {...manufacturer}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Manufacturer;