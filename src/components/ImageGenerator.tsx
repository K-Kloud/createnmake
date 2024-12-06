import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "./Icons";

const artStyles = [
  "Realistic",
  "Anime",
  "Digital Art",
  "Oil Painting",
  "Watercolor",
  "Sketch",
  "Cyberpunk",
  "Abstract",
];

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [width, setWidth] = useState([512]);
  const [height, setHeight] = useState([512]);
  const [style, setStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // TODO: Implement actual image generation
    console.log("Generating image with:", {
      prompt,
      width: width[0],
      height: height[0],
      style,
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Image Generated!",
        description: "Your image has been generated successfully.",
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card image-generator">
      <CardHeader>
        <CardTitle>Generate Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <Input
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Art Style</label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              {artStyles.map((style) => (
                <SelectItem key={style} value={style.toLowerCase()}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Width</label>
          <Slider
            value={width}
            onValueChange={setWidth}
            min={256}
            max={1024}
            step={64}
          />
          <span className="text-sm text-gray-400">{width}px</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Height</label>
          <Slider
            value={height}
            onValueChange={setHeight}
            min={256}
            max={1024}
            step={64}
          />
          <span className="text-sm text-gray-400">{height}px</span>
        </div>

        <Button 
          className="w-full" 
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
        >
          {isGenerating ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Image"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};