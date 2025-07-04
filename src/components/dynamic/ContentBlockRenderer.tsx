import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContentBlock {
  id: string;
  block_key: string;
  block_type: string;
  title: string;
  content: any;
  metadata: any;
}

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ block }) => {
  const renderContent = () => {
    switch (block.block_type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: block.content.html || block.content.text }} />
          </div>
        );

      case 'hero':
        return (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">{block.content.heading}</h1>
            {block.content.subheading && (
              <p className="text-xl text-muted-foreground mb-6">{block.content.subheading}</p>
            )}
            {block.content.cta && (
              <Button size="lg" asChild>
                <a href={block.content.cta.url}>{block.content.cta.text}</a>
              </Button>
            )}
          </div>
        );

      case 'card':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{block.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{block.content.description}</p>
              {block.content.features && (
                <ul className="list-disc pl-5 mt-4">
                  {block.content.features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );

      case 'image':
        return (
          <div className="text-center">
            <img 
              src={block.content.url} 
              alt={block.content.alt || block.title}
              className="max-w-full h-auto rounded-lg"
            />
            {block.content.caption && (
              <p className="text-sm text-muted-foreground mt-2">{block.content.caption}</p>
            )}
          </div>
        );

      case 'grid':
        return (
          <div className={`grid gap-4 ${block.content.columns ? `grid-cols-${block.content.columns}` : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {block.content.items?.map((item: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-4 border border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground">
              Unknown content block type: {block.block_type}
            </p>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(block.content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="content-block" data-block-key={block.block_key}>
      {renderContent()}
    </div>
  );
};