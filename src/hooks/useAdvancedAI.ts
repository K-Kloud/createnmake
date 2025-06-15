
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';

interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: 'image_style' | 'color_palette' | 'trending_items' | 'personalized_prompt';
  recommendation_data: any;
  confidence_score: number;
  created_at: string;
}

interface PersonalizationProfile {
  user_id: string;
  preferred_styles: string[];
  color_preferences: string[];
  activity_patterns: Record<string, any>;
  engagement_history: Record<string, any>;
}

export const useAdvancedAI = () => {
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  // Get AI recommendations for user
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async (): Promise<AIRecommendation[]> => {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate recommendations based on user data
      const { data: userImages } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: userLikes } = await supabase
        .from('image_likes')
        .select('image_id')
        .limit(100);

      // Simulate AI analysis
      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          user_id: 'current_user',
          recommendation_type: 'image_style',
          recommendation_data: {
            style: 'minimalist',
            reason: 'Based on your recent activity, you prefer clean, simple designs'
          },
          confidence_score: 0.85,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'current_user',
          recommendation_type: 'color_palette',
          recommendation_data: {
            colors: ['#2563eb', '#7c3aed', '#059669'],
            reason: 'These colors align with your engagement patterns'
          },
          confidence_score: 0.78,
          created_at: new Date().toISOString()
        }
      ];

      return mockRecommendations;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Generate personalized prompts
  const generatePersonalizedPrompt = useMutation({
    mutationFn: async ({ basePrompt, userPreferences }: { 
      basePrompt: string; 
      userPreferences: PersonalizationProfile 
    }) => {
      // In a real implementation, this would call an AI service like OpenAI
      // to enhance the prompt based on user preferences
      
      const enhancedPrompt = `${basePrompt}, in ${userPreferences.preferred_styles.join(' and ')} style, 
        with color palette focusing on ${userPreferences.color_preferences.join(', ')}`;

      // Log the AI enhancement with proper JSON serialization
      const queryResult = {
        original: basePrompt,
        enhanced: enhancedPrompt,
        preferences_applied: {
          user_id: userPreferences.user_id,
          preferred_styles: userPreferences.preferred_styles,
          color_preferences: userPreferences.color_preferences,
          activity_patterns: userPreferences.activity_patterns,
          engagement_history: userPreferences.engagement_history
        }
      };

      await supabase
        .from('ai_agent_queries')
        .insert({
          agent_id: 1,
          query_text: `Enhanced prompt for user preferences: ${basePrompt}`,
          query_result: queryResult as any
        });

      return enhancedPrompt;
    },
    onSuccess: () => {
      toast({
        title: 'Prompt Enhanced',
        description: 'Your prompt has been personalized based on your preferences',
      });
    },
    onError: (error) => {
      handleError(error, 'generating personalized prompt');
    }
  });

  // Analyze image trends
  const analyzeImageTrends = useMutation({
    mutationFn: async () => {
      const { data: recentImages } = await supabase
        .from('generated_images')
        .select('item_type, tags, likes, views, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Analyze trends (simplified)
      const trendAnalysis = {
        trending_items: recentImages?.reduce((acc: any, img) => {
          acc[img.item_type] = (acc[img.item_type] || 0) + (img.likes || 0) + (img.views || 0);
          return acc;
        }, {}),
        popular_tags: recentImages?.flatMap(img => img.tags || [])
          .reduce((acc: any, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {}),
        engagement_rate: recentImages?.reduce((sum, img) => sum + (img.likes || 0) + (img.views || 0), 0) / (recentImages?.length || 1)
      };

      // Store analysis results
      await supabase
        .from('ai_agent_queries')
        .insert({
          agent_id: 1,
          query_text: 'Weekly trend analysis',
          query_result: trendAnalysis as any
        });

      return trendAnalysis;
    },
    onSuccess: (data) => {
      toast({
        title: 'Trend Analysis Complete',
        description: `Analyzed ${Object.keys(data.trending_items || {}).length} trending categories`,
      });
    },
    onError: (error) => {
      handleError(error, 'analyzing image trends');
    }
  });

  // Smart content tagging
  const generateSmartTags = useMutation({
    mutationFn: async ({ imageUrl, prompt }: { imageUrl: string; prompt: string }) => {
      // In a real implementation, this would use computer vision AI
      // to analyze the image and suggest relevant tags
      
      const suggestedTags = [
        // Extract keywords from prompt
        ...prompt.toLowerCase().split(' ').filter(word => 
          word.length > 3 && !['with', 'and', 'the', 'for', 'from'].includes(word)
        ),
        // Add contextual tags based on image analysis (simulated)
        'modern', 'design', 'creative'
      ].slice(0, 8); // Limit to 8 tags

      return suggestedTags;
    },
    onError: (error) => {
      handleError(error, 'generating smart tags');
    }
  });

  return {
    recommendations,
    isLoading: recommendationsLoading,
    generatePersonalizedPrompt: generatePersonalizedPrompt.mutate,
    analyzeImageTrends: analyzeImageTrends.mutate,
    generateSmartTags: generateSmartTags.mutate,
    isGeneratingPrompt: generatePersonalizedPrompt.isPending,
    isAnalyzingTrends: analyzeImageTrends.isPending,
    isGeneratingTags: generateSmartTags.isPending
  };
};
