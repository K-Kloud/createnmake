import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DynamicPagesManager } from './system/DynamicPagesManager';
import { ComponentsManager } from './system/ComponentsManager';
import { NavigationManager } from './system/NavigationManager';
import { FeatureFlagsManager } from './system/FeatureFlagsManager';
import { ContentManager } from './system/ContentManager';
import { Database, Settings, Navigation, Flag, FileText, Component } from 'lucide-react';

export const SystemManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Management</h1>
        <p className="text-muted-foreground">Manage all system components, pages, and configurations</p>
      </div>

      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Component className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <DynamicPagesManager />
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <ComponentsManager />
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <NavigationManager />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeatureFlagsManager />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <ContentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};