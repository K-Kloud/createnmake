import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sanitizeAdminHtml, escapeHtml } from '@/utils/security';

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
        // Sanitize HTML content to prevent XSS attacks
        const sanitizedContent = sanitizeAdminHtml(block.content.html || block.content.text || '');
        return (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </div>
        );

      case 'hero':
        return (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">{escapeHtml(block.content.heading || '')}</h1>
            {block.content.subheading && (
              <p className="text-xl text-muted-foreground mb-6">{escapeHtml(block.content.subheading)}</p>
            )}
            {block.content.cta && (
              <Button size="lg" asChild>
                <a href={escapeHtml(block.content.cta.url || '#')}>{escapeHtml(block.content.cta.text || '')}</a>
              </Button>
            )}
          </div>
        );

      case 'card':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{escapeHtml(block.title || '')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{escapeHtml(block.content.description || '')}</p>
              {block.content.features && (
                <ul className="list-disc pl-5 mt-4">
                  {block.content.features.map((feature: string, index: number) => (
                    <li key={index}>{escapeHtml(feature || '')}</li>
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
              src={escapeHtml(block.content.url || '')} 
              alt={escapeHtml(block.content.alt || block.title || '')}
              className="max-w-full h-auto rounded-lg"
            />
            {block.content.caption && (
              <p className="text-sm text-muted-foreground mt-2">{escapeHtml(block.content.caption)}</p>
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
                      src={escapeHtml(item.image || '')} 
                      alt={escapeHtml(item.title || '')}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-semibold mb-2">{escapeHtml(item.title || '')}</h3>
                  <p className="text-sm text-muted-foreground">{escapeHtml(item.description || '')}</p>
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