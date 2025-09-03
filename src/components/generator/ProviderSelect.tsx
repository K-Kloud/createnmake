import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

interface ProviderSelectProps {
  value: string;
  onChange: (provider: string) => void;
  disabled?: boolean;
}

export const ProviderSelect = ({ value, onChange, disabled }: ProviderSelectProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">AI Provider</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
        className="grid grid-cols-1 gap-3"
      >
        <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="openai" id="openai" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="openai" className="text-sm font-medium cursor-pointer">
                    OpenAI DALL-E
                  </Label>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Reliable</span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  High-quality generation with automatic model fallback
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="gemini" id="gemini" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="gemini" className="text-sm font-medium cursor-pointer">
                    Google Gemini
                  </Label>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Advanced</span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Enhanced retry logic and detailed prompts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="xai" id="xai" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="xai" className="text-sm font-medium cursor-pointer">
                    xAI Grok
                  </Label>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Fast</span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Fast and creative image generation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="huggingface" id="huggingface" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="huggingface" className="text-sm font-medium cursor-pointer">
                    Hugging Face FLUX
                  </Label>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Backup</span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Open-source FLUX model, reliable fallback
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>
    </div>
  );
};