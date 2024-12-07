import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [width, setWidth] = useState([512]);
  const [height, setHeight] = useState([512]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!selectedItem) {
      toast({
        title: "Item Required",
        description: "Please select an item to generate",
        variant: "destructive",
      });
      return;
    }
    
    if (!prompt) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description of what you want to generate",
        variant: "destructive",
      });
      return;
    }

    // Generation logic here
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Select onValueChange={setSelectedItem} value={selectedItem}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select what you want to create" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tailor Items</SelectLabel>
              <SelectItem value="suit">Suit</SelectItem>
              <SelectItem value="dress-shirt">Dress Shirt</SelectItem>
              <SelectItem value="trousers">Trousers</SelectItem>
              <SelectItem value="dress">Dress</SelectItem>
              <SelectItem value="blazer">Blazer</SelectItem>
              <SelectItem value="waistcoat">Waistcoat</SelectItem>
              <SelectItem value="skirt">Skirt</SelectItem>
              <SelectItem value="coat">Coat</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Cobbler Items</SelectLabel>
              <SelectItem value="dress-shoes">Dress Shoes</SelectItem>
              <SelectItem value="boots">Boots</SelectItem>
              <SelectItem value="sneakers">Sneakers</SelectItem>
              <SelectItem value="sandals">Sandals</SelectItem>
              <SelectItem value="loafers">Loafers</SelectItem>
              <SelectItem value="oxford-shoes">Oxford Shoes</SelectItem>
              <SelectItem value="heels">Heels</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Leather Goods</SelectLabel>
              <SelectItem value="leather-bag">Leather Bag</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
              <SelectItem value="belt">Belt</SelectItem>
              <SelectItem value="briefcase">Briefcase</SelectItem>
              <SelectItem value="backpack">Backpack</SelectItem>
              <SelectItem value="messenger-bag">Messenger Bag</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Accessories</SelectLabel>
              <SelectItem value="tie">Tie</SelectItem>
              <SelectItem value="bow-tie">Bow Tie</SelectItem>
              <SelectItem value="scarf">Scarf</SelectItem>
              <SelectItem value="gloves">Gloves</SelectItem>
              <SelectItem value="hat">Hat</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Describe what you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Width: {width}px</label>
          <Slider
            value={width}
            onValueChange={setWidth}
            min={256}
            max={1024}
            step={64}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Height: {height}px</label>
          <Slider
            value={height}
            onValueChange={setHeight}
            min={256}
            max={1024}
            step={64}
            className="w-full"
          />
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={handleGenerate} 
            className="w-full"
            disabled={!prompt || !selectedItem}
          >
            Generate
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Image Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-square bg-card/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Preview will appear here</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};