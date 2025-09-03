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
                <Label htmlFor="openai" className="text-sm font-medium cursor-pointer">
                  OpenAI GPT-Image-1
                </Label>
                <p className="text-xs text-white/60 mt-1">
                  Latest model with advanced controls and high quality
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
                <Label htmlFor="gemini" className="text-sm font-medium cursor-pointer">
                  Google Gemini 2.5 Flash
                </Label>
                <p className="text-xs text-white/60 mt-1">
                  Fast generation with enhanced prompts and context awareness
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
                <Label htmlFor="xai" className="text-sm font-medium cursor-pointer">
                  xAI Grok 4
                </Label>
                <p className="text-xs text-white/60 mt-1">
                  Cutting-edge model with unique style and capabilities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>
    </div>
  );
};