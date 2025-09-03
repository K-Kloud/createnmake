import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ImageProviderInfoProps {
  provider: string;
  provider_version?: string;
  generation_settings?: Record<string, any>;
  className?: string;
}

export const ImageProviderInfo = ({ 
  provider, 
  provider_version, 
  generation_settings,
  className = "" 
}: ImageProviderInfoProps) => {
  const getProviderDisplay = (provider: string, version?: string) => {
    switch (provider) {
      case 'openai':
        return {
          name: version === 'gpt-image-1' ? 'GPT-Image-1' : 'DALL-E 3',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          description: version === 'gpt-image-1' 
            ? 'Latest OpenAI model with advanced controls' 
            : 'OpenAI DALL-E 3'
        };
      case 'google-gemini':
      case 'gemini':
        return {
          name: 'Gemini 2.5 Flash',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          description: 'Google\'s fast image generation model'
        };
      case 'xai':
        return {
          name: 'Grok 4',
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          description: 'xAI\'s cutting-edge image model'
        };
      default:
        return {
          name: provider,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          description: `Generated with ${provider}`
        };
    }
  };

  const providerInfo = getProviderDisplay(provider, provider_version);

  const formatGenerationSettings = (settings?: Record<string, any>) => {
    if (!settings || Object.keys(settings).length === 0) return null;

    const displaySettings = Object.entries(settings)
      .filter(([key, value]) => 
        key !== 'enhanced_prompt' && 
        key !== 'model' && 
        value !== undefined && 
        value !== null
      )
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return displaySettings || null;
  };

  const settingsText = formatGenerationSettings(generation_settings);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${providerInfo.color} text-xs`}
      >
        {providerInfo.name}
      </Badge>
      
      {(provider_version || settingsText) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{providerInfo.description}</p>
                {provider_version && (
                  <p className="text-xs text-muted-foreground">
                    Version: {provider_version}
                  </p>
                )}
                {settingsText && (
                  <p className="text-xs text-muted-foreground">
                    Settings: {settingsText}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};