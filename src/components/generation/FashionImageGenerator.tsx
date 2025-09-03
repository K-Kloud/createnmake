import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Palette, RefreshCw } from 'lucide-react';

// Fashion categories from the custom instructions
const FASHION_CATEGORIES = {
  'tops': {
    label: 'Tops & Shirts',
    items: [
      'White cotton crew neck t-shirt',
      'Heather grey v-neck t-shirt', 
      'Navy blue long-sleeve t-shirt',
      'Black ribbed tank top',
      'Yellow knit crop top',
      'Emerald green silk blouse',
      'Classic white Oxford button-down shirt',
      'Linen beige tunic top'
    ]
  },
  'bottoms': {
    label: 'Bottoms & Pants',
    items: [
      'Dark wash denim skinny jeans',
      'Medium wash straight-leg jeans',
      'Light wash distressed boyfriend jeans',
      'Beige linen wide-leg trousers',
      'Black high-waisted athletic leggings',
      'Navy blue pleated culottes',
      'Olive green cotton cargo pants'
    ]
  },
  'dresses': {
    label: 'Dresses & Gowns',
    items: [
      'Classic sleeveless little black dress',
      'Floral print bohemian maxi dress',
      'Red A-line midi dress',
      'Silver sequin mini dress',
      'Navy blue jersey wrap dress',
      'Striped cotton shirt dress',
      'Yellow gingham sundress'
    ]
  },
  'outerwear': {
    label: 'Jackets & Coats',
    items: [
      'Classic beige double-breasted trench coat',
      'Navy wool double-breasted pea coat',
      'Medium wash classic denim jacket',
      'Black leather biker jacket',
      'Olive green MA-1 style nylon bomber jacket',
      'Khaki hooded parka with faux fur trim'
    ]
  },
  'african': {
    label: 'African Traditional',
    items: [
      'Stylish Ankara print jumpsuit with bold, vibrant pattern',
      'Modern navy blue two-piece Senator-style kaftan with subtle embroidery',
      'Contemporary fitted Agbada in charcoal grey cashmere wool',
      'Fashionable women\'s Agbada made from purple silk',
      'Flowing, floor-length Ankara maxi gown',
      'Modern unisex Dashiki shirt in bold blue and orange Angelina print'
    ]
  }
};

const STYLE_MODIFIERS = [
  'worn by a young Nigerian woman as a model',
  'worn by a young Nigerian man as a model',
  'photo realistic',
  'studio lighting',
  'white background',
  'detailed fabric texture',
  '8K quality'
];

interface FashionImageGeneratorProps {
  onGenerate?: (prompt: string) => void;
}

export const FashionImageGenerator: React.FC<FashionImageGeneratorProps> = ({
  onGenerate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomPrompt = () => {
    const categories = Object.keys(FASHION_CATEGORIES);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryItems = FASHION_CATEGORIES[randomCategory as keyof typeof FASHION_CATEGORIES].items;
    const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
    
    const basePrompt = randomItem;
    const modifiers = STYLE_MODIFIERS.join(', ');
    const fullPrompt = `${basePrompt}, ${modifiers}`;
    
    setSelectedCategory(randomCategory);
    setSelectedItem(randomItem);
    setCustomPrompt(fullPrompt);
    
    return fullPrompt;
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedItem('');
    setCustomPrompt('');
  };

  const handleItemSelect = (item: string) => {
    setSelectedItem(item);
    const modifiers = STYLE_MODIFIERS.join(', ');
    const fullPrompt = `${item}, ${modifiers}`;
    setCustomPrompt(fullPrompt);
  };

  const handleGenerate = async () => {
    if (!customPrompt.trim()) {
      generateRandomPrompt();
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate?.(customPrompt);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Fashion Design Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fashion Category</label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a fashion category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FASHION_CATEGORIES).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item Selection */}
          {selectedCategory && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Fashion Item</label>
              <div className="grid grid-cols-1 gap-2">
                {FASHION_CATEGORIES[selectedCategory as keyof typeof FASHION_CATEGORIES].items.map((item, index) => (
                  <Button
                    key={index}
                    variant={selectedItem === item ? "default" : "outline"}
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => handleItemSelect(item)}
                  >
                    <span className="line-clamp-2">{item}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Design Prompt</label>
            <Textarea
              placeholder="Describe the fashion item you want to generate..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
            />
          </div>

          {/* Style Modifiers */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Style Modifiers</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_MODIFIERS.map((modifier, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {modifier}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="flex-1 gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Design'}
            </Button>
            <Button 
              variant="outline" 
              onClick={generateRandomPrompt}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Random
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};