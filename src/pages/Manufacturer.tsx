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
import { useNavigate } from "react-router-dom";

const iconMap: Record<string, LucideIcon> = {
  Scissors,
  Footprints,
  Printer,
  Gem,
  Briefcase,
  Armchair,
};

// Map categories to relevant Unsplash images
const categoryImages: Record<string, string> = {
  "Tailor": "photo-1517022812141-23620dba5c23",
  "Cobbler": "photo-1452960962994-acf4fd70b632",
  "Printer": "photo-1562408590-e32931084e23",
  "Goldsmith": "photo-1515562141207-7a88fb7ce338",
  "Leather Worker": "photo-1473188588951-666fce8e7c68",
  "Furniture Maker": "photo-1449247709967-d4461a6a6103"
};

const Manufacturer = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {manufacturerCategories.map((category) => {
            const IconComponent = iconMap[category.icon];
            const imageId = categoryImages[category.name];
            
            return (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-lg cursor-pointer hover-scale"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setDialogOpen(true);
                }}
              >
                <div className="relative h-64 w-full">
                  <img
                    src={`https://images.unsplash.com/${imageId}`}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      {IconComponent && <IconComponent className="w-6 h-6" />}
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                    </div>
                    <p className="text-sm text-gray-200">{category.description}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
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
                <div 
                  key={manufacturer.id}
                  onClick={() => {
                    setDialogOpen(false);
                    navigate(`/manufacturer/${manufacturer.id}`);
                  }}
                  className="cursor-pointer"
                >
                  <ManufacturerCard {...manufacturer} />
                </div>
              ))}
              {filteredManufacturers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No manufacturers found for this category.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Manufacturer;