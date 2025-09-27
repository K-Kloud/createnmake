import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  keywords: string[];
  topics: string[];
}

export interface ContentGeneration {
  title: string;
  description: string;
  shortDescription: string;
  tags: string[];
  seoKeywords: string[];
  marketingCopy: string;
  socialMediaPost: string;
  productFeatures: string[];
}

export interface ChatResponse {
  message: string;
  confidence: number;
  suggestions: string[];
  relatedTopics: string[];
  mood: 'helpful' | 'informative' | 'creative' | 'analytical';
}

export const useNLPProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const { toast } = useToast();

  const analyzeSentiment = useCallback(async (text: string): Promise<SentimentAnalysis | null> => {
    if (!text.trim()) return null;

    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock sentiment analysis with realistic results
      const sentiments = ['positive', 'negative', 'neutral'] as const;
      const selectedSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

      const analysis: SentimentAnalysis = {
        overall: selectedSentiment,
        confidence: 0.75 + Math.random() * 0.2,
        emotions: {
          joy: Math.random() * (selectedSentiment === 'positive' ? 0.8 : 0.3),
          anger: Math.random() * (selectedSentiment === 'negative' ? 0.7 : 0.2),
          fear: Math.random() * 0.3,
          sadness: Math.random() * (selectedSentiment === 'negative' ? 0.6 : 0.2),
          surprise: Math.random() * 0.4,
          disgust: Math.random() * 0.2,
        },
        keywords: extractKeywords(text),
        topics: extractTopics(text)
      };

      toast({
        title: 'Sentiment Analysis Complete',
        description: `Detected ${analysis.overall} sentiment with ${Math.round(analysis.confidence * 100)}% confidence`,
      });

      return analysis;
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Failed to analyze sentiment.',
      });
      return null;
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  const generateContent = useCallback(async (prompt: string, contentType: string = 'product'): Promise<ContentGeneration | null> => {
    if (!prompt.trim()) return null;

    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const content: ContentGeneration = {
        title: generateTitle(prompt, contentType),
        description: generateDescription(prompt),
        shortDescription: generateShortDescription(prompt),
        tags: generateTags(prompt),
        seoKeywords: generateSEOKeywords(prompt),
        marketingCopy: generateMarketingCopy(prompt),
        socialMediaPost: generateSocialMediaPost(prompt),
        productFeatures: generateProductFeatures(prompt)
      };

      toast({
        title: 'Content Generated',
        description: 'AI has created comprehensive content for your product.',
      });

      return content;
    } catch (error) {
      console.error('Content generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Failed to generate content.',
      });
      return null;
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  const chatWithFashionAI = useCallback(async (message: string): Promise<ChatResponse | null> => {
    if (!message.trim()) return null;

    // Add user message to history
    setChatHistory(prev => [...prev, { 
      role: 'user', 
      content: message, 
      timestamp: new Date() 
    }]);

    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response: ChatResponse = {
        message: generateFashionResponse(message),
        confidence: 0.8 + Math.random() * 0.15,
        suggestions: generateSuggestions(message),
        relatedTopics: generateRelatedTopics(message),
        mood: getMoodFromMessage(message)
      };

      // Add AI response to history
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: response.message, 
        timestamp: new Date() 
      }]);

      return response;
    } catch (error) {
      console.error('Chat response failed:', error);
      toast({
        variant: 'destructive',
        title: 'Chat Error',
        description: 'Failed to get response from fashion AI.',
      });
      return null;
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  // Helper functions for content generation
  const extractKeywords = (text: string): string[] => {
    const keywords = ['quality', 'style', 'comfortable', 'trendy', 'affordable', 'elegant', 'modern', 'classic'];
    return keywords.filter(() => Math.random() > 0.7).slice(0, 5);
  };

  const extractTopics = (text: string): string[] => {
    const topics = ['fashion', 'design', 'quality', 'trends', 'style', 'comfort', 'materials'];
    return topics.filter(() => Math.random() > 0.6).slice(0, 4);
  };

  const generateTitle = (prompt: string, type: string): string => {
    const titles = [
      'Contemporary Minimalist Collection',
      'Elegant Modern Fashion Line',
      'Sophisticated Style Series',
      'Timeless Design Collection'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateDescription = (prompt: string): string => {
    return `Elevate your wardrobe with our thoughtfully designed contemporary pieces that blend modern aesthetics with timeless elegance. Crafted from sustainable materials, each item represents the perfect balance of style, comfort, and environmental consciousness. This collection embodies the essence of sophisticated fashion while maintaining versatility for any occasion.`;
  };

  const generateShortDescription = (prompt: string): string => {
    return 'Modern, sustainable fashion that combines elegance with everyday comfort.';
  };

  const generateTags = (prompt: string): string[] => {
    const allTags = ['minimalist', 'contemporary', 'sustainable', 'elegant', 'versatile', 'modern', 'classic', 'comfortable', 'stylish'];
    return allTags.filter(() => Math.random() > 0.4).slice(0, 6);
  };

  const generateSEOKeywords = (prompt: string): string[] => {
    return ['minimalist fashion', 'contemporary design', 'sustainable clothing', 'elegant wardrobe', 'modern style'];
  };

  const generateMarketingCopy = (prompt: string): string => {
    return 'Discover the art of effortless style with our Contemporary Collection. Where sustainability meets sophistication, creating pieces that transcend seasonal trends and become wardrobe essentials.';
  };

  const generateSocialMediaPost = (prompt: string): string => {
    return '✨ New arrival alert! Sustainable meets style in our latest collection. #SustainableFashion #ContemporaryStyle #MinimalistChic';
  };

  const generateProductFeatures = (prompt: string): string[] => {
    return [
      'Sustainable materials',
      'Versatile design',
      'Premium quality construction',
      'Timeless aesthetic',
      'Comfortable fit'
    ];
  };

  const generateFashionResponse = (message: string): string => {
    const responses = [
      "Based on current fashion trends, I'd recommend exploring minimalist designs with bold color accents. This season is all about sustainable materials and versatile pieces that can transition from day to night.",
      "For this style direction, consider incorporating organic textures and earth tones. The contemporary fashion market is moving towards timeless pieces with modern silhouettes that offer both comfort and sophistication.",
      "This trend aligns perfectly with the current movement towards gender-neutral fashion. I suggest exploring oversized fits with structured details and focusing on quality fabrics that age beautifully.",
      "Looking at market analytics, this aesthetic has shown significant growth. Consider adding premium materials and unique design elements to capture the luxury segment while maintaining accessibility."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateSuggestions = (message: string): string[] => {
    return [
      'Explore color palette options',
      'Consider sustainable materials',
      'Look into current trend forecasts',
      'Research target demographic preferences'
    ];
  };

  const generateRelatedTopics = (message: string): string[] => {
    return ['Trend Forecasting', 'Sustainable Fashion', 'Color Theory', 'Design Process'];
  };

  const getMoodFromMessage = (message: string): 'helpful' | 'informative' | 'creative' | 'analytical' => {
    const moods: Array<'helpful' | 'informative' | 'creative' | 'analytical'> = ['helpful', 'informative', 'creative', 'analytical'];
    return moods[Math.floor(Math.random() * moods.length)];
  };

  return {
    processing,
    chatHistory,
    analyzeSentiment,
    generateContent,
    chatWithFashionAI,
    clearChatHistory
  };
};