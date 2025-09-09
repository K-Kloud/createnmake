import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Palette, Layout, Eye, Layers } from 'lucide-react';

export type ReferenceType = 'style' | 'color' | 'composition' | 'texture';

interface ReferenceTypeSelectorProps {
  selectedType: ReferenceType;
  onTypeChange: (type: ReferenceType) => void;
  hasReferenceImages: boolean;
}

const referenceTypes = [
  {
    id: 'style' as const,
    label: 'Style Transfer',
    description: 'Apply the overall aesthetic and artistic style',
    icon: Eye,
  },
  {
    id: 'color' as const,
    label: 'Color Palette',
    description: 'Extract and use the dominant colors',
    icon: Palette,
  },
  {
    id: 'composition' as const,
    label: 'Composition',
    description: 'Copy the layout and positioning',
    icon: Layout,
  },
  {
    id: 'texture' as const,
    label: 'Texture & Material',
    description: 'Replicate surface textures and materials',
    icon: Layers,
  },
];

export const ReferenceTypeSelector: React.FC<ReferenceTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  hasReferenceImages,
}) => {
  if (!hasReferenceImages) {
    return null;
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-semantic-primary">
          Reference Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedType} onValueChange={onTypeChange}>
          <div className="grid grid-cols-1 gap-3">
            {referenceTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label
                    htmlFor={type.id}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>
        
        <div className="mt-3 p-2 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Choose how your reference images should influence the generation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};