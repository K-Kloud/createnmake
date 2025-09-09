import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Images, 
  Zap, 
  Palette, 
  Layout, 
  Eye, 
  Layers,
  Info
} from 'lucide-react';

interface AdvancedFeaturesInfoProps {
  isMultiMode: boolean;
}

export const AdvancedFeaturesInfo: React.FC<AdvancedFeaturesInfoProps> = ({ 
  isMultiMode 
}) => {
  const features = [
    {
      icon: Images,
      title: 'Multiple References',
      description: 'Upload up to 3 reference images for complex style blending',
      enabled: isMultiMode,
    },
    {
      icon: Zap,
      title: 'Auto Optimization',
      description: 'Images are automatically optimized for best generation results',
      enabled: true,
    },
    {
      icon: Palette,
      title: 'Style Transfer',
      description: 'Extract and apply artistic styles from reference images',
      enabled: true,
    },
    {
      icon: Layout,
      title: 'Composition Analysis',
      description: 'Copy layout and positioning from reference images',
      enabled: true,
    },
    {
      icon: Eye,
      title: 'Visual Context',
      description: 'AI understands visual elements for better generation',
      enabled: true,
    },
    {
      icon: Layers,
      title: 'Texture Extraction',
      description: 'Replicate surface textures and material properties',
      enabled: true,
    },
  ];

  if (!isMultiMode) {
    return null;
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-semantic-primary flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Advanced Multi-Modal Features
          <Badge variant="secondary" className="text-xs">
            Phase 3
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index}>
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 ${
                    feature.enabled ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {feature.title}
                      {feature.enabled && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                </div>
                {index < features.length - 1 && (
                  <Separator className="opacity-30 my-2" />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-3 p-2 bg-primary/10 rounded-md border border-primary/20">
          <p className="text-xs text-primary leading-relaxed">
            🚀 Advanced integration mode combines multiple reference images with intelligent 
            optimization for professional-quality results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};