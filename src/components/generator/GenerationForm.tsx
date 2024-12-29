import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ItemSelect } from "./ItemSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { Badge } from "@/components/ui/badge";

const keywordSuggestions = {
  "suit": ["tailored", "slim-fit", "double-breasted", "pinstripe", "classic"],
  "dress-shirt": ["oxford", "french cuff", "spread collar", "fitted", "cotton"],
  "trousers": ["pleated", "flat-front", "wool", "tapered", "high-waisted"],
  "dress": ["evening", "cocktail", "a-line", "fitted", "silk"],
  "blazer": ["structured", "casual", "wool", "single-breasted", "navy"],
  "waistcoat": ["formal", "fitted", "textured", "lapelled", "traditional"],
  "skirt": ["pencil", "pleated", "a-line", "midi", "high-waisted"],
  "coat": ["overcoat", "trench", "wool", "cashmere", "belted"],
  "dress-shoes": ["oxford", "leather", "cap-toe", "brogue", "polished"],
  "boots": ["chelsea", "leather", "ankle", "combat", "dress"],
  "sneakers": ["leather", "minimalist", "high-top", "athletic", "designer"],
  "sandals": ["leather", "strappy", "gladiator", "flat", "wedge"],
  "loafers": ["penny", "tassel", "suede", "leather", "driving"],
  "oxford-shoes": ["wingtip", "cap-toe", "leather", "formal", "classic"],
  "heels": ["stiletto", "block", "kitten", "platform", "peep-toe"],
  "leather-bag": ["structured", "tote", "satchel", "briefcase", "crossbody"],
  "wallet": ["bifold", "leather", "card-holder", "zip-around", "minimalist"],
  "belt": ["leather", "dress", "reversible", "braided", "designer"],
  "briefcase": ["leather", "expandable", "laptop", "classic", "modern"],
  "backpack": ["leather", "laptop", "travel", "minimalist", "convertible"],
  "messenger-bag": ["leather", "canvas", "laptop", "crossbody", "vintage"],
  "tie": ["silk", "striped", "solid", "paisley", "knit"],
  "bow-tie": ["silk", "pre-tied", "self-tie", "formal", "patterned"],
  "scarf": ["silk", "wool", "cashmere", "printed", "lightweight"],
  "gloves": ["leather", "driving", "lined", "touchscreen", "formal"],
  "hat": ["fedora", "panama", "wool", "structured", "classic"],
  
  // Furniture
  "dining-table": ["solid wood", "extendable", "rustic", "modern", "handcrafted"],
  "coffee-table": ["wooden", "glass-top", "storage", "minimalist", "artisanal"],
  "bed-frame": ["platform", "four-poster", "sleigh", "storage", "traditional"],
  "bookshelf": ["floating", "ladder", "built-in", "modular", "industrial"],
  "cabinet": ["display", "storage", "vintage", "modern", "hand-painted"],
  "chair": ["dining", "accent", "rocking", "upholstered", "carved"],
  "bench": ["storage", "entryway", "garden", "dining", "decorative"],
  "side-table": ["nesting", "round", "vintage", "modern", "hand-carved"],
  
  // Home Textiles
  "quilt": ["patchwork", "modern", "traditional", "hand-stitched", "custom"],
  "duvet-cover": ["cotton", "linen", "printed", "embroidered", "organic"],
  "throw-pillow": ["decorative", "embroidered", "textured", "custom", "patterned"],
  "curtains": ["blackout", "sheer", "lined", "patterned", "custom-length"],
  "table-runner": ["embroidered", "quilted", "festive", "modern", "traditional"],
  "area-rug": ["hand-woven", "vintage-style", "modern", "geometric", "traditional"],
  "tapestry": ["wall-hanging", "hand-woven", "modern", "traditional", "custom"],
  
  // Decor & Accessories
  "wall-art": ["mixed-media", "textile", "sculptural", "modern", "traditional"],
  "ceramic-vase": ["hand-thrown", "glazed", "sculptural", "modern", "decorative"],
  "decorative-bowl": ["ceramic", "wooden", "metal", "hand-crafted", "painted"],
  "candle-holder": ["metal", "ceramic", "wooden", "modern", "traditional"],
  "mirror-frame": ["carved", "gilded", "modern", "vintage-style", "custom"],
  "lamp": ["table", "floor", "pendant", "ceramic", "metal"],
  "basket": ["woven", "storage", "decorative", "natural", "custom"],
};

interface GenerationFormProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedItem: string;
  onItemChange: (value: string) => void;
  selectedRatio: string;
  onRatioChange: (value: string) => void;
  referenceImage: File | null;
  onReferenceImageUpload: (file: File | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isSignedIn: boolean;
}

export const GenerationForm = ({
  prompt,
  onPromptChange,
  selectedItem,
  onItemChange,
  selectedRatio,
  onRatioChange,
  referenceImage,
  onReferenceImageUpload,
  onGenerate,
  isGenerating,
  isSignedIn,
}: GenerationFormProps) => {
  const handleKeywordClick = (keyword: string) => {
    const newPrompt = prompt ? `${prompt}, ${keyword}` : keyword;
    onPromptChange(newPrompt);
  };

  return (
    <div className="space-y-6">
      <ItemSelect 
        value={selectedItem} 
        onChange={onItemChange} 
      />

      <div className="relative">
        <Textarea
          placeholder="Describe what you want to generate..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="absolute bottom-2 right-2">
          <ReferenceImageUpload
            referenceImage={referenceImage}
            onUpload={onReferenceImageUpload}
          />
        </div>
      </div>

      <Button 
        onClick={onGenerate} 
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        disabled={!prompt || !selectedItem || isGenerating}
      >
        {!isSignedIn ? "Sign in to Generate" : "Generate"}
      </Button>

      <AspectRatioSelect
        value={selectedRatio}
        onChange={onRatioChange}
      />

      {selectedItem && (
        <div className="space-y-2">
          <p className="text-sm text-center text-white/60">Suggested keywords:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {keywordSuggestions[selectedItem]?.map((keyword) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => handleKeywordClick(keyword)}
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
