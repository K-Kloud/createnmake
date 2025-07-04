import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ContentManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Content management coming soon...</p>
      </CardContent>
    </Card>
  );
};