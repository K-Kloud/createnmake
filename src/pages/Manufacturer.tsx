import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ManufacturerCard } from "@/components/manufacturer/ManufacturerCard";
import { CategoryCard } from "@/components/manufacturer/CategoryCard";
import { manufacturers } from "@/data/manufacturers";
import { manufacturerCategories } from "@/data/manufacturerCategories";
import { 
  Scissors, 
  Footprints, 
  Printer, 
  Gem, 
  Briefcase, 
  Armchair,
  type LucideIcon 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  Scissors,
  Footprints,
  Printer,
  Gem,
  Briefcase,
  Armchair,
};

const categoryImages = {
  "Tailor": "https://images.unsplash.com/photo-1452960962994-acf4fd70b632",
  "Cobbler": "https://images.unsplash.com/photo-1449247709967-d4461a6a6103",
  "Printer": "https://images.unsplash.com/photo-1485833077593-4278bba3f11f",
  "Goldsmith": "https://images.unsplash.com/photo-1441057206919-63d19fac2369",
  "Leather Worker": "https://images.unsplash.com/photo-1469041797191-50ace28483c3",
  "Furniture Maker": "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2",
};

const Manufacturer = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  
  const selectedImage = localStorage.getItem('selectedManufacturerImage');
  const imageDetails = selectedImage ? JSON.parse(selectedImage) : null;

  const filteredManufacturers = selectedCategory
    ? manufacturers.filter(m => m.type === selectedCategory)
    : [];

  const selectedManufacturerDetails = manufacturers.find(m => m.name === selectedManufacturer);

  const getCategoryCount = (categoryName: string) => {
    return manufacturers.filter(m => m.type === categoryName).length;
  };

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

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Find a Manufacturer</h2>
          <Select onValueChange={setSelectedManufacturer} value={selectedManufacturer || ""}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a manufacturer" />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.name}>
                  {manufacturer.name} - {manufacturer.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedManufacturerDetails && (
          <div className="mb-12">
            <ManufacturerCard {...selectedManufacturerDetails} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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