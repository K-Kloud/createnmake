import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ComponentsManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Components Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Component registry management coming soon...</p>
      </CardContent>
    </Card>
  );
};