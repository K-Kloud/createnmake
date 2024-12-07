import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface ProductCustomizationProps {
  selectedImage: string | null;
  onImageSelect: (image: string) => void;
}

export const ProductCustomization = ({
  selectedImage,
  onImageSelect,
}: ProductCustomizationProps) => {
  const [size, setSize] = useState([12]); // inches
  const [material, setMaterial] = useState("canvas");

  const materials = [
    { value: "canvas", label: "Canvas Print" },
    { value: "poster", label: "Premium Poster" },
    { value: "metal", label: "Metal Print" },
    { value: "acrylic", label: "Acrylic Print" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Customize Your Product</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Selected design"
            className="w-full h-64 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-64 bg-secondary rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Select an image from your gallery</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Material</label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.value} value={material.value}>
                    {material.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Size (inches)</label>
            <Slider
              value={size}
              onValueChange={setSize}
              min={8}
              max={48}
              step={4}
            />
            <span className="text-sm text-muted-foreground">{size}″</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};