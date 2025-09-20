import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  ArrowRight, 
  Copy, 
  TrendingUp,
  DollarSign,
  Clock,
  Award,
  Lightbulb
} from 'lucide-react';
import { DesignOptimization } from '@/services/designIntelligence';
import { useToast } from '@/hooks/use-toast';

interface DesignOptimizerProps {
  optimization?: DesignOptimization | null;
  isOptimizing?: boolean;
  onApplyOptimization?: (optimizedPrompt: string) => void;
  onGenerateVariation?: (variation: any) => void;
}

const getImpactIcon = (impact: string) => {
  switch (impact) {
    case 'cost':
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case 'time':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'quality':
      return <Award className="h-4 w-4 text-purple-500" />;
    case 'manufacturability':
      return <TrendingUp className="h-4 w-4 text-orange-500" />;
    default:
      return <Sparkles className="h-4 w-4 text-gray-500" />;
  }
};

const getImpactColor = (impact: string) => {
  const colors = {
    cost: 'border-green-200 bg-green-50',
    time: 'border-blue-200 bg-blue-50',
    quality: 'border-purple-200 bg-purple-50',
    manufacturability: 'border-orange-200 bg-orange-50'
  };
  
  return colors[impact as keyof typeof colors] || 'border-gray-200 bg-gray-50';
};

export const DesignOptimizer: React.FC<DesignOptimizerProps> = ({
  optimization,
  isOptimizing = false,
  onApplyOptimization,
  onGenerateVariation
}) => {
  const [selectedModifications, setSelectedModifications] = useState<number[]>([]);
  const { toast } = useToast();

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to clipboard",
      description: "Optimized prompt has been copied.",
    });
  };

  const handleApplyOptimization = () => {
    if (optimization && onApplyOptimization) {
      onApplyOptimization(optimization.optimizedPrompt);
      toast({
        title: "Optimization Applied",
        description: "Using the optimized prompt for generation.",
      });
    }
  };

  const toggleModification = (index: number) => {
    setSelectedModifications(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (isOptimizing) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-5 w-5 animate-spin" />
            <span>Optimizing design...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!optimization) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Run design validation first to see optimization suggestions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Design Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="prompt" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prompt">Optimized Prompt</TabsTrigger>
              <TabsTrigger value="modifications">Modifications</TabsTrigger>
              <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
            </TabsList>

            {/* Optimized Prompt Tab */}
            <TabsContent value="prompt" className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">Optimized Prompt:</div>
                <div className="relative">
                  <Textarea
                    value={optimization.optimizedPrompt}
                    readOnly
                    className="min-h-[100px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopyPrompt(optimization.optimizedPrompt)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleApplyOptimization} className="flex-1">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Use Optimized Prompt
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Modifications Tab */}
            <TabsContent value="modifications" className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  Suggested Modifications ({optimization.suggestedModifications.length})
                </div>
                
                <div className="space-y-3">
                  {optimization.suggestedModifications.map((mod, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedModifications.includes(index)
                          ? 'border-primary bg-primary/5'
                          : getImpactColor(mod.impact)
                      }`}
                      onClick={() => toggleModification(index)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getImpactIcon(mod.impact)}
                            <span className="font-medium capitalize">{mod.aspect}</span>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {mod.impact}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground mb-1">Original:</div>
                            <div className="p-2 bg-muted/50 rounded text-xs">
                              {mod.original}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Suggested:</div>
                            <div className="p-2 bg-primary/10 rounded text-xs">
                              {mod.suggested}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <strong>Reasoning:</strong> {mod.reasoning}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedModifications.length > 0 && (
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      Selected {selectedModifications.length} modification(s)
                    </div>
                    <Button size="sm" onClick={() => setSelectedModifications([])}>
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Alternatives Tab */}
            <TabsContent value="alternatives" className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  Alternative Designs ({optimization.alternativeDesigns.length})
                </div>
                
                <div className="grid gap-4">
                  {optimization.alternativeDesigns.map((alt, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alt.variant}</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onGenerateVariation?.(alt)}
                          >
                            Generate
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {alt.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="text-sm font-medium mb-2 text-green-600">
                              Benefits:
                            </div>
                            <ul className="space-y-1">
                              {alt.benefits.map((benefit, bidx) => (
                                <li key={bidx} className="text-sm flex items-start gap-2">
                                  <span className="text-green-500 mt-1">+</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2 text-orange-600">
                              Trade-offs:
                            </div>
                            <ul className="space-y-1">
                              {alt.tradeoffs.map((tradeoff, tidx) => (
                                <li key={tidx} className="text-sm flex items-start gap-2">
                                  <span className="text-orange-500 mt-1">-</span>
                                  {tradeoff}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};