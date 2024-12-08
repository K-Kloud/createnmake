import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";

const aspectRatios = {
  "square": { width: 1080, height: 1080, label: "Square (1:1)" },
  "portrait": { width: 1080, height: 1350, label: "Portrait (4:5)" },
  "landscape": { width: 1920, height: 1080, label: "Landscape (16:9)" },
  "story": { width: 1080, height: 1920, label: "Story (9:16)" },
  "youtube": { width: 2560, height: 1440, label: "YouTube (16:9)" },
  "facebook": { width: 1200, height: 630, label: "Facebook (1.91:1)" },
  "twitter": { width: 1600, height: 900, label: "Twitter (16:9)" },
  "linkedin": { width: 1200, height: 627, label: "LinkedIn (1.91:1)" }
};

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("square");
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

    setPreviewOpen(true);
  };

  return (
    <div className="space-y-8 animate-float">
      <div className="glass-card p-6 rounded-xl space-y-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(110,89,165,0.5)] hover:border-primary/50">
        <div className="space-y-2">
          <Select onValueChange={setSelectedItem} value={selectedItem}>
            <SelectTrigger className="w-full bg-card/30 border-white/10">
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
            className="min-h-[100px] bg-card/30 border-white/10 placeholder:text-white/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Output Size</label>
          <Select onValueChange={setSelectedRatio} value={selectedRatio}>
            <SelectTrigger className="w-full bg-card/30 border-white/10">
              <SelectValue placeholder="Choose aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Common Sizes</SelectLabel>
                {Object.entries(aspectRatios).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-sm text-white/60">
            Size: {aspectRatios[selectedRatio].width}x{aspectRatios[selectedRatio].height}px
          </p>
        </div>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleGenerate} 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              disabled={!prompt || !selectedItem}
            >
              Generate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Generated Image Preview</DialogTitle>
            </DialogHeader>
            <div 
              className="bg-card/50 rounded-lg flex items-center justify-center"
              style={{
                aspectRatio: `${aspectRatios[selectedRatio].width} / ${aspectRatios[selectedRatio].height}`
              }}
            >
              <p className="text-muted-foreground">Preview will appear here</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
