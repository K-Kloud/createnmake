import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Template {
  id: string;
  title: string;
  prompt: string;
  category: string;
  imageUrl: string;
  itemType: string;
}

const templates: Template[] = [
  {
    id: "1",
    title: "Summer Dress",
    prompt: "Flowing summer dress with floral patterns, light fabric, beach-ready style",
    category: "Dresses",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop",
    itemType: "dresses"
  },
  {
    id: "2",
    title: "Casual T-Shirt",
    prompt: "Modern minimalist t-shirt, cotton fabric, neutral colors, everyday wear",
    category: "Tops",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop",
    itemType: "tops"
  },
  {
    id: "3",
    title: "Denim Jacket",
    prompt: "Classic denim jacket, vintage wash, brass buttons, timeless style",
    category: "Outerwear",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop",
    itemType: "outerwear"
  },
  {
    id: "4",
    title: "Ankara Print Dress",
    prompt: "Vibrant Ankara print dress, African-inspired patterns, bold colors, contemporary fit",
    category: "Nigerian",
    imageUrl: "https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=400&h=600&fit=crop",
    itemType: "nigerian"
  },
  {
    id: "5",
    title: "Athletic Wear",
    prompt: "Performance activewear, moisture-wicking fabric, ergonomic design, vibrant accent colors",
    category: "Activewear",
    imageUrl: "https://images.unsplash.com/photo-1556906918-a03d1f0ce1dd?w=400&h=600&fit=crop",
    itemType: "activewear"
  }
];

interface TemplateGalleryProps {
  onSelectTemplate: (prompt: string, itemType: string) => void;
}

export const TemplateGallery = ({ onSelectTemplate }: TemplateGalleryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === "All" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-2xl font-bold">Design Templates</h2>
        </div>
        <p className="text-muted-foreground">
          Get inspired by these templates or use them as a starting point
        </p>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Button
                    onClick={() => onSelectTemplate(template.prompt, template.itemType)}
                    className="w-full gap-2"
                    size="sm"
                  >
                    Use Template
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold">{template.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.prompt}
                </p>
                <span className="inline-block text-xs font-mono uppercase tracking-wider text-primary">
                  {template.category}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
