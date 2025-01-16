import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ItemSelect } from "./ItemSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { Badge } from "@/components/ui/badge";

const keywordSuggestions = {
  // Men's Wear
  "mens-formal-suit": ["tailored", "slim-fit", "double-breasted", "pinstripe", "classic"],
  "mens-tuxedo": ["black-tie", "satin-lapel", "formal", "classic", "fitted"],
  "mens-dress-shirt": ["oxford", "french-cuff", "spread-collar", "fitted", "cotton"],
  "mens-waistcoat": ["formal", "fitted", "textured", "lapelled", "traditional"],
  "mens-casual-shirt": ["relaxed", "cotton", "patterned", "short-sleeve", "linen"],
  "mens-jeans": ["slim-fit", "straight-leg", "distressed", "dark-wash", "vintage"],
  "mens-dashiki": ["embroidered", "colorful", "traditional", "festive", "patterned"],
  "mens-agbada": ["embroidered", "grand", "ceremonial", "flowing", "royal"],
  "mens-kaftan": ["embroidered", "casual", "summer", "comfortable", "elegant"],

  // Women's Wear
  "womens-formal-dress": ["elegant", "fitted", "floor-length", "structured", "sophisticated"],
  "womens-gown": ["evening", "flowing", "embellished", "luxurious", "dramatic"],
  "womens-blouse": ["silk", "ruffled", "fitted", "feminine", "classic"],
  "womens-pencil-skirt": ["high-waisted", "fitted", "professional", "classic", "tailored"],
  "womens-iro-buba": ["traditional", "embroidered", "ceremonial", "elegant", "cultural"],
  "womens-wrapper": ["ankara", "lace", "embroidered", "festive", "traditional"],

  // Traditional African
  "african-kente": ["woven", "geometric", "colorful", "ceremonial", "royal"],
  "african-kitenge": ["printed", "vibrant", "flowing", "patterned", "cultural"],
  "african-aso-ebi": ["coordinated", "celebratory", "elegant", "festive", "traditional"],
  
  // Contemporary African
  "modern-ankara-jacket": ["contemporary", "fusion", "structured", "bold", "stylish"],
  "modern-african-jumpsuit": ["modern", "printed", "fitted", "elegant", "versatile"],
  "modern-streetwear": ["urban", "bold", "contemporary", "cultural", "trendy"],

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
