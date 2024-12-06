import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [width, setWidth] = useState([512]);
  const [height, setHeight] = useState([512]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // TODO: Implement actual image generation
    console.log("Generating image with prompt:", prompt);
    console.log("Dimensions:", width[0], "x", height[0]);
    setTimeout(() => setIsGenerating(false), 1000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card">
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
          {isGenerating ? "Generating..." : "Generate Image"}
        </Button>
      </CardContent>
    </Card>
  );
};