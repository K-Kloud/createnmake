import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseProductDescriptionProps {
  prompt: string;
  productType?: string;
  price?: string;
  creator?: string;
  productId?: string;
}

export const useProductDescription = ({
  prompt,
  productType,
  price,
  creator,
  productId
}: UseProductDescriptionProps) => {
  const [description, setDescription] = useState<string>(prompt);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateDescription = async () => {
    if (!prompt || hasGenerated) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke(
        'generate-product-description',
        {
          body: {
            prompt,
            productType,
            price,
            creator
          }
        }
      );

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data?.success && data?.description) {
        setDescription(data.description);
        setHasGenerated(true);
      } else {
        throw new Error(data?.error || 'Failed to generate description');
      }
    } catch (err) {
      console.error('Error generating product description:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Keep original prompt as fallback
      setDescription(prompt);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on mount if conditions are met
  useEffect(() => {
    if (prompt && !hasGenerated && !isLoading) {
      generateDescription();
    }
  }, [prompt, productType, price, creator]);

  return {
    description,
    isLoading,
    error,
    regenerate: generateDescription,
    hasGenerated
  };
};
