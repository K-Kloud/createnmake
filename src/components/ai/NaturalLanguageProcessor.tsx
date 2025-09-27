import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, BarChart3, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SentimentResult {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
  keywords: string[];
}

interface GeneratedContent {
  title: string;
  description: string;
  tags: string[];
  seoKeywords: string[];
  marketingCopy: string;
}

export const NaturalLanguageProcessor = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [contentInput, setContentInput] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  
  const [sentimentInput, setSentimentInput] = useState('');
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  
  const { toast } = useToast();

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      // Simulate AI chat response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fashionResponse = getFashionExpertResponse(userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', content: fashionResponse }]);
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Chat Error',
        description: 'Failed to get response from fashion AI assistant.',
      });
    } finally {
      setChatLoading(false);
    }
  };

  const getFashionExpertResponse = (input: string): string => {
    const responses = [
      "Based on current fashion trends, I'd recommend exploring minimalist designs with bold color accents. This season is all about sustainable materials and versatile pieces.",
      "For this style, consider incorporating organic textures and earth tones. The contemporary fashion market is moving towards timeless pieces with modern silhouettes.",
      "This trend aligns perfectly with the current movement towards gender-neutral fashion. I suggest exploring oversized fits with structured details.",
      "Looking at market analytics, this aesthetic has shown 34% growth in the last quarter. Consider adding premium materials to capture the luxury segment.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateProductContent = async () => {
    if (!contentInput.trim()) return;
    
    setContentLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockContent: GeneratedContent = {
        title: "Contemporary Minimalist Collection",
        description: "Elevate your wardrobe with our thoughtfully designed contemporary pieces that blend modern aesthetics with timeless elegance. Crafted from sustainable materials, each item represents the perfect balance of style, comfort, and environmental consciousness.",
        tags: ["minimalist", "contemporary", "sustainable", "elegant", "versatile"],
        seoKeywords: ["minimalist fashion", "contemporary design", "sustainable clothing", "elegant wardrobe", "modern style"],
        marketingCopy: "Discover the art of effortless style with our Contemporary Minimalist Collection. Where sustainability meets sophistication, creating pieces that transcend seasonal trends and become wardrobe essentials."
      };
      
      setGeneratedContent(mockContent);
      toast({
        title: 'Content Generated',
        description: 'AI has created comprehensive product content.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Failed to generate product content.',
      });
    } finally {
      setContentLoading(false);
    }
  };

  const analyzeSentiment = async () => {
    if (!sentimentInput.trim()) return;
    
    setSentimentLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockSentiment: SentimentResult = {
        overall: Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
        confidence: 0.85 + Math.random() * 0.1,
        emotions: {
          joy: Math.random() * 0.8,
          anger: Math.random() * 0.2,
          fear: Math.random() * 0.1,
          sadness: Math.random() * 0.3,
          surprise: Math.random() * 0.4,
        },
        keywords: ['quality', 'style', 'comfortable', 'trendy', 'affordable']
      };
      
      setSentimentResult(mockSentiment);
      toast({
        title: 'Analysis Complete',
        description: 'Sentiment analysis has been processed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Failed to analyze sentiment.',
      });
    } finally {
      setSentimentLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-success text-white';
      case 'negative': return 'bg-destructive text-white';
      default: return 'bg-warning text-white';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Natural Language Processing Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Fashion AI Chat</TabsTrigger>
              <TabsTrigger value="content">Content Generation</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              <div className="border rounded-lg p-4 h-80 overflow-y-auto bg-muted/20">
                {chatHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Ask me anything about fashion trends, styling, or design insights...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card border p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            <span className="text-sm text-muted-foreground">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about fashion trends, styling tips, or design advice..."
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  disabled={chatLoading}
                />
                <Button onClick={handleChatSubmit} disabled={chatLoading || !chatInput.trim()}>
                  Send
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <Textarea
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="Describe your product or fashion item (e.g., 'minimalist black dress with contemporary design')..."
                className="min-h-[100px]"
              />
              
              <Button 
                onClick={generateProductContent} 
                disabled={contentLoading || !contentInput.trim()}
                className="w-full"
              >
                {contentLoading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    Generating Content...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Product Content
                  </span>
                )}
              </Button>
              
              {generatedContent && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div>
                    <h4 className="font-semibold mb-2">Generated Title:</h4>
                    <p className="text-sm bg-muted p-3 rounded">{generatedContent.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Product Description:</h4>
                    <p className="text-sm bg-muted p-3 rounded">{generatedContent.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Marketing Copy:</h4>
                    <p className="text-sm bg-muted p-3 rounded">{generatedContent.marketingCopy}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {generatedContent.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">SEO Keywords:</h4>
                      <div className="flex flex-wrap gap-1">
                        {generatedContent.seoKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sentiment" className="space-y-4">
              <Textarea
                value={sentimentInput}
                onChange={(e) => setSentimentInput(e.target.value)}
                placeholder="Paste customer feedback, reviews, or any text for sentiment analysis..."
                className="min-h-[100px]"
              />
              
              <Button 
                onClick={analyzeSentiment} 
                disabled={sentimentLoading || !sentimentInput.trim()}
                className="w-full"
              >
                {sentimentLoading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    Analyzing Sentiment...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analyze Sentiment
                  </span>
                )}
              </Button>
              
              {sentimentResult && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="text-center">
                    <Badge className={getSentimentColor(sentimentResult.overall)}>
                      {sentimentResult.overall.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Confidence: {Math.round(sentimentResult.confidence * 100)}%
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Emotion Breakdown:</h4>
                    <div className="space-y-2">
                      {Object.entries(sentimentResult.emotions).map(([emotion, score]) => (
                        <div key={emotion} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{emotion}:</span>
                          <span className="text-sm font-medium">{Math.round(score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Keywords:</h4>
                    <div className="flex flex-wrap gap-1">
                      {sentimentResult.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};