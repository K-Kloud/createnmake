import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ContentBlockRenderer } from './ContentBlockRenderer';

interface DynamicContentProps {
  blockKey?: string;
  locale?: string;
  className?: string;
}

export const DynamicContent: React.FC<DynamicContentProps> = ({
  blockKey,
  locale = 'en',
  className = ''
}) => {
  const { data: contentBlocks, isLoading } = useQuery({
    queryKey: ['content-blocks', blockKey, locale],
    queryFn: async () => {
      let query = supabase
        .from('content_blocks')
        .select('*')
        .eq('is_active', true)
        .eq('locale', locale);

      if (blockKey) {
        query = query.eq('block_key', blockKey);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!contentBlocks?.length) {
    return blockKey ? (
      <div className="text-muted-foreground text-sm">
        Content block "{blockKey}" not found
      </div>
    ) : null;
  }

  return (
    <div className={className}>
      {contentBlocks.map((block) => (
        <ContentBlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

export default DynamicContent;