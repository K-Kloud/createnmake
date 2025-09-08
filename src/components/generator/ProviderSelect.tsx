import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProviderSelectProps {
  value: string;
  onChange: (provider: string) => void;
  disabled?: boolean;
  hasReferenceImage?: boolean;
}

export const ProviderSelect = ({ value, onChange, disabled, hasReferenceImage }: ProviderSelectProps) => {
  const getProviderSupport = (provider: string) => {
    const supportMap = {
      openai: { supportsReference: true, method: 'Variations API' },
      gemini: { supportsReference: true, method: 'Visual Context' },
      xai: { supportsReference: true, method: 'Style Analysis' },
      huggingface: { supportsReference: true, method: 'Style Analysis' }
    };
    return supportMap[provider as keyof typeof supportMap] || { supportsReference: false, method: '' };
  };
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Label htmlFor="openai" className="text-sm font-medium cursor-pointer">
                    OpenAI DALL-E
                  </Label>
                  <Badge variant="secondary" className="text-xs">Reliable</Badge>
                  {hasReferenceImage && (
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                      ✓ Variations
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  High-quality generation with {getProviderSupport('openai').supportsReference ? 'native' : 'basic'} reference support
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Label htmlFor="gemini" className="text-sm font-medium cursor-pointer">
                    Google Gemini
                  </Label>
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">Advanced</Badge>
                  {hasReferenceImage && (
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                      ✓ Visual Context
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Enhanced retry logic with {getProviderSupport('gemini').supportsReference ? 'multi-modal' : 'text-only'} capabilities
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Label htmlFor="xai" className="text-sm font-medium cursor-pointer">
                    xAI Grok
                  </Label>
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">Fast</Badge>
                  {hasReferenceImage && (
                    <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                      ✓ Style Analysis
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Fast creative generation with {getProviderSupport('xai').supportsReference ? 'intelligent style' : 'basic text'} processing
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Label htmlFor="huggingface" className="text-sm font-medium cursor-pointer">
                    Hugging Face FLUX
                  </Label>
                  <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400">Open Source</Badge>
                  {hasReferenceImage && (
                    <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                      ✓ Style Analysis
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  FLUX.1-schnell model with {getProviderSupport('huggingface').supportsReference ? 'enhanced prompt' : 'basic'} reference handling
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>
    </div>
  );
};