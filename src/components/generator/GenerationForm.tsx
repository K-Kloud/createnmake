import React from "react";
import { useImageGeneration } from "./useImageGeneration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export const GenerationForm = () => {
  const {
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    steps,
    setSteps,
    guidance,
    setGuidance,
    seed,
    setSeed,
    isLoading,
    handleGenerate,
    isAdvancedMode,
    setIsAdvancedMode,
    HomeButton,
  } = useImageGeneration();

  return (
    <div className="relative w-full max-w-2xl mx-auto p-6">
      <HomeButton />
      <form onSubmit={handleGenerate} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create..."
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="advanced-mode"
            checked={isAdvancedMode}
            onCheckedChange={setIsAdvancedMode}
          />
          <Label htmlFor="advanced-mode">Advanced Mode</Label>
        </div>

        {isAdvancedMode && (
          <>
            <div className="space-y-2">
              <Label htmlFor="negative-prompt">Negative Prompt</Label>
              <Textarea
                id="negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What you don't want to see in the image..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Steps ({steps})</Label>
              <Slider
                value={[steps]}
                onValueChange={(value) => setSteps(value[0])}
                min={1}
                max={150}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Guidance Scale ({guidance})</Label>
              <Slider
                value={[guidance]}
                onValueChange={(value) => setGuidance(value[0])}
                min={1}
                max={20}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seed">Seed</Label>
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                placeholder="Random seed for generation"
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </form>
    </div>
  );
};