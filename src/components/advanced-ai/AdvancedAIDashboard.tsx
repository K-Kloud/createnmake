import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIRecommendations } from './AIRecommendations';
import { SmartContentGeneration } from './SmartContentGeneration';
import { PersonalizationSettings } from './PersonalizationSettings';
import { Brain, Sparkles, Settings, TrendingUp } from 'lucide-react';

export const AdvancedAIDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold gradient-text">Advanced AI Features</h1>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Content Generation
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Personalization
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="mt-6">
          <AIRecommendations />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <SmartContentGeneration />
        </TabsContent>

        <TabsContent value="personalization" className="mt-6">
          <PersonalizationSettings />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Insights & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>AI insights and analytics coming soon.</p>
                <p className="text-sm">This will show detailed analytics about your AI usage and performance metrics.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};