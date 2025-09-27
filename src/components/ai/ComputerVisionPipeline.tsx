import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Eye, Palette, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DetectionResult {
  item: string;
  confidence: number;
  category: string;
  style: string;
  colors: string[];
  trendScore: number;
}

interface VisionAnalysis {
  detectedItems: DetectionResult[];
  dominantColors: string[];
  styleTransfer: string;
  trendAnalysis: {
    score: number;
    category: string;
    predictions: string[];
  };
}

export const ComputerVisionPipeline = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    
    setAnalyzing(true);
    setProgress(0);

    try {
      // Simulate AI processing stages
      const stages = [
        { name: 'Image preprocessing', duration: 500 },
        { name: 'Fashion item detection', duration: 800 },
        { name: 'Style classification', duration: 600 },
        { name: 'Color palette extraction', duration: 400 },
        { name: 'Trend analysis', duration: 700 }
      ];

      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, stages[i].duration));
        setProgress(((i + 1) / stages.length) * 100);
      }

      // Mock analysis results
      const mockAnalysis: VisionAnalysis = {
        detectedItems: [
          {
            item: 'Dress',
            confidence: 0.94,
            category: 'Women\'s Clothing',
            style: 'Contemporary',
            colors: ['#1a1a2e', '#16213e', '#0f3460'],
            trendScore: 0.87
          },
          {
            item: 'Accessories',
            confidence: 0.78,
            category: 'Jewelry',
            style: 'Minimalist',
            colors: ['#c4b5fd', '#a78bfa'],
            trendScore: 0.72
          }
        ],
        dominantColors: ['#1a1a2e', '#16213e', '#c4b5fd', '#a78bfa', '#0f3460'],
        styleTransfer: 'Contemporary minimalist with modern elements',
        trendAnalysis: {
          score: 0.85,
          category: 'Emerging Trend',
          predictions: ['Minimalist jewelry trending up 23%', 'Dark color palettes gaining popularity', 'Contemporary styles dominating market']
        }
      };

      setAnalysis(mockAnalysis);
      
      toast({
        title: 'Analysis Complete',
        description: 'Computer vision pipeline processed the image successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Failed to process image through computer vision pipeline.',
      });
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-success';
    if (confidence >= 0.7) return 'bg-warning';
    return 'bg-destructive';
  };

  const getTrendColor = (score: number) => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Computer Vision Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={analyzing}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Upload fashion image for AI analysis
                </span>
              </label>
            </div>

            {selectedImage && (
              <div className="flex justify-center">
                <img
                  src={selectedImage}
                  alt="Selected for analysis"
                  className="max-w-xs rounded-lg shadow-md"
                />
              </div>
            )}

            {analyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing image...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Detected Fashion Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.detectedItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{item.item}</h3>
                      <Badge className={`${getConfidenceColor(item.confidence)} text-white`}>
                        {Math.round(item.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <div className="font-medium">{item.category}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Style:</span>
                        <div className="font-medium">{item.style}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Detected Colors:</span>
                      <div className="flex gap-2">
                        {item.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-6 h-6 rounded-full border-2 border-muted"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">Trend Score:</span>
                      <span className={`text-sm font-medium ${getTrendColor(item.trendScore)}`}>
                        {Math.round(item.trendScore * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {analysis.dominantColors.map((color, index) => (
                      <div key={index} className="text-center space-y-1">
                        <div
                          className="w-full h-12 rounded-lg border-2 border-muted"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono text-muted-foreground">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Style Transfer Analysis:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysis.styleTransfer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getTrendColor(analysis.trendAnalysis.score)}`}>
                      {Math.round(analysis.trendAnalysis.score * 100)}%
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {analysis.trendAnalysis.category}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Trend Predictions:</h4>
                    {analysis.trendAnalysis.predictions.map((prediction, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {prediction}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};