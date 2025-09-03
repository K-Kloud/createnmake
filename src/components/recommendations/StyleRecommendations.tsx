import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Palette, 
  User,
  Heart,
  RefreshCw,
  Wand2,
  Target,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GeneratedImage } from '@/types/content';
import { toast } from 'sonner';

interface StyleProfile {
  preferredTypes: string[];
  popularColors: string[];
  styleKeywords: string[];
  generationFrequency: number;
  engagementRate: number;
}

interface Recommendation {
  id: string;
  type: 'style' | 'trending' | 'personalized' | 'seasonal';
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  confidence: number;
  image?: GeneratedImage;
  reasoning: string;
}

export const StyleRecommendations = () => {
  const { session } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [trendingStyles, setTrendingStyles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadUserStyleProfile();
      loadTrendingStyles();
      generateRecommendations();
    } else {
      loadPublicRecommendations();
    }
  }, [session]);

  const loadUserStyleProfile = async () => {
    if (!session?.user) return;

    try {
      // Analyze user's generation history
      const { data: images, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (images && images.length > 0) {
        const profile = analyzeUserStyle(images);
        setStyleProfile(profile);
      }
    } catch (error) {
      console.error('Error loading style profile:', error);
    }
  };

  const analyzeUserStyle = (images: GeneratedImage[]): StyleProfile => {
    const typeCount: Record<string, number> = {};
    const colorKeywords: Record<string, number> = {};
    const styleKeywords: Record<string, number> = {};
    let totalEngagement = 0;

    images.forEach(image => {
      // Count item types
      if (image.item_type) {
        typeCount[image.item_type] = (typeCount[image.item_type] || 0) + 1;
      }

      // Extract color and style keywords from prompt
      if (image.prompt) {
        const prompt = image.prompt.toLowerCase();
        
        // Color keywords
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'black', 'white', 'brown', 'orange', 'gray', 'navy', 'beige', 'gold', 'silver'];
        colors.forEach(color => {
          if (prompt.includes(color)) {
            colorKeywords[color] = (colorKeywords[color] || 0) + 1;
          }
        });

        // Style keywords
        const styles = ['vintage', 'modern', 'casual', 'formal', 'boho', 'minimalist', 'elegant', 'sporty', 'chic', 'trendy', 'classic', 'artistic'];
        styles.forEach(style => {
          if (prompt.includes(style)) {
            styleKeywords[style] = (styleKeywords[style] || 0) + 1;
          }
        });
      }

      // Calculate engagement
      totalEngagement += (image.likes || 0) + (image.views || 0) * 0.1;
    });

    return {
      preferredTypes: Object.entries(typeCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([type]) => type),
      popularColors: Object.entries(colorKeywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([color]) => color),
      styleKeywords: Object.entries(styleKeywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([style]) => style),
      generationFrequency: images.length,
      engagementRate: images.length > 0 ? totalEngagement / images.length : 0
    };
  };

  const loadTrendingStyles = async () => {
    try {
      // Get trending styles from recent popular images
      const { data: trendingImages, error } = await supabase
        .from('generated_images')
        .select('item_type, prompt')
        .eq('is_public', true)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('likes', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (trendingImages) {
        const typeFrequency: Record<string, number> = {};
        trendingImages.forEach(img => {
          if (img.item_type) {
            typeFrequency[img.item_type] = (typeFrequency[img.item_type] || 0) + 1;
          }
        });

        const trending = Object.entries(typeFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([type]) => type);

        setTrendingStyles(trending);
      }
    } catch (error) {
      console.error('Error loading trending styles:', error);
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const recs: Recommendation[] = [];

      // Personalized recommendations based on user style
      if (styleProfile) {
        recs.push(...generatePersonalizedRecs());
      }

      // Trending recommendations
      recs.push(...generateTrendingRecs());

      // Seasonal recommendations
      recs.push(...generateSeasonalRecs());

      // Style exploration recommendations
      recs.push(...generateExplorationRecs());

      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedRecs = (): Recommendation[] => {
    if (!styleProfile) return [];

    const recs: Recommendation[] = [];

    // Recommend variations of preferred types
    styleProfile.preferredTypes.slice(0, 2).forEach((type, index) => {
      const colors = styleProfile.popularColors;
      const styles = styleProfile.styleKeywords;
      
      recs.push({
        id: `personal-${index}`,
        type: 'personalized',
        title: `Your Style: ${type} Variation`,
        description: `A new take on your favorite ${type} style`,
        prompt: `A stylish ${type} in ${colors[0] || 'elegant'} with ${styles[0] || 'modern'} design elements`,
        tags: [type, colors[0] || 'elegant', styles[0] || 'modern'].filter(Boolean),
        confidence: 0.85 + Math.random() * 0.1,
        reasoning: `Based on your preference for ${type} and ${colors[0]} colors`
      });
    });

    return recs;
  };

  const generateTrendingRecs = (): Recommendation[] => {
    const recs: Recommendation[] = [];

    trendingStyles.slice(0, 2).forEach((type, index) => {
      recs.push({
        id: `trending-${index}`,
        type: 'trending',
        title: `Trending: ${type}`,
        description: `Popular ${type} styles that are trending this week`,
        prompt: `A trendy ${type} with contemporary design and modern aesthetic`,
        tags: [type, 'trending', 'popular'],
        confidence: 0.75 + Math.random() * 0.1,
        reasoning: `${type} is trending with high engagement this week`
      });
    });

    return recs;
  };

  const generateSeasonalRecs = (): Recommendation[] => {
    const currentSeason = getCurrentSeason();
    const seasonalStyles = getSeasonalStyles(currentSeason);

    return seasonalStyles.map((style, index) => ({
      id: `seasonal-${index}`,
      type: 'seasonal',
      title: `${currentSeason} Collection`,
      description: `Perfect for the ${currentSeason.toLowerCase()} season`,
      prompt: `A ${style.type} perfect for ${currentSeason.toLowerCase()}, featuring ${style.description}`,
      tags: [style.type, currentSeason.toLowerCase(), 'seasonal'],
      confidence: 0.7 + Math.random() * 0.1,
      reasoning: `Seasonal recommendation for ${currentSeason}`
    }));
  };

  const generateExplorationRecs = (): Recommendation[] => {
    const explorationStyles = ['vintage', 'futuristic', 'bohemian', 'minimalist', 'maximalist'];
    
    return explorationStyles.slice(0, 2).map((style, index) => ({
      id: `exploration-${index}`,
      type: 'style',
      title: `Explore: ${style} Style`,
      description: `Try something new with ${style} aesthetics`,
      prompt: `A creative piece showcasing ${style} design principles and aesthetic`,
      tags: [style, 'exploration', 'new'],
      confidence: 0.6 + Math.random() * 0.1,
      reasoning: `Style exploration recommendation to broaden your creative horizons`
    }));
  };

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  const getSeasonalStyles = (season: string) => {
    const styles = {
      Spring: [
        { type: 'Dress', description: 'light fabrics and floral patterns' },
        { type: 'Jacket', description: 'lightweight and breathable materials' }
      ],
      Summer: [
        { type: 'Tank Top', description: 'cooling fabrics and bright colors' },
        { type: 'Shorts', description: 'comfortable and airy designs' }
      ],
      Fall: [
        { type: 'Sweater', description: 'cozy knits and warm tones' },
        { type: 'Jacket', description: 'layering pieces in earth colors' }
      ],
      Winter: [
        { type: 'Coat', description: 'warm materials and rich textures' },
        { type: 'Sweater', description: 'thick knits and winter colors' }
      ]
    };
    return styles[season as keyof typeof styles] || styles.Spring;
  };

  const loadPublicRecommendations = async () => {
    setIsLoading(true);
    try {
      // Load general recommendations for non-authenticated users
      const generalRecs: Recommendation[] = [
        {
          id: 'general-1',
          type: 'trending',
          title: 'Popular Designs',
          description: 'Most liked designs this week',
          prompt: 'A trendy casual outfit with modern aesthetics',
          tags: ['trending', 'popular', 'casual'],
          confidence: 0.8,
          reasoning: 'Popular among all users'
        },
        {
          id: 'general-2',
          type: 'style',
          title: 'Classic Styles',
          description: 'Timeless fashion that never goes out of style',
          prompt: 'A classic elegant dress with sophisticated design',
          tags: ['classic', 'elegant', 'timeless'],
          confidence: 0.75,
          reasoning: 'Always in demand'
        }
      ];

      setRecommendations(generalRecs);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecommendations = () => {
    setIsGenerating(true);
    generateRecommendations().finally(() => setIsGenerating(false));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'personalized': return User;
      case 'trending': return TrendingUp;
      case 'seasonal': return Palette;
      case 'style': return Sparkles;
      default: return Wand2;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personalized': return 'bg-blue-500';
      case 'trending': return 'bg-red-500';
      case 'seasonal': return 'bg-green-500';
      case 'style': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-pulse text-muted-foreground">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Style Recommendations</h2>
          <p className="text-muted-foreground">Personalized suggestions to inspire your next creation</p>
        </div>
        <Button 
          onClick={refreshRecommendations} 
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Style Profile Summary */}
      {styleProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Your Style Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Favorite Types</h4>
                <div className="flex flex-wrap gap-1">
                  {styleProfile.preferredTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Popular Colors</h4>
                <div className="flex flex-wrap gap-1">
                  {styleProfile.popularColors.map(color => (
                    <Badge key={color} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Style Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {styleProfile.styleKeywords.map(keyword => (
                    <Badge key={keyword} className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const Icon = getTypeIcon(rec.type);
          return (
            <Card key={rec.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md ${getTypeColor(rec.type)}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(rec.confidence * 100)}% match
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded-md p-3 mb-3">
                  <p className="text-sm italic">"{rec.prompt}"</p>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mb-4">{rec.reasoning}</p>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Target className="h-4 w-4 mr-1" />
                    Try This Style
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start creating images to get personalized style recommendations!
            </p>
            <Button onClick={refreshRecommendations}>
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};