import { useState, useCallback } from 'react';
import { quoteEngine, QuoteRequest, QuoteResult } from '@/services/quoteEngine';
import { useToast } from '@/components/ui/use-toast';

export const useQuoteGeneration = () => {
  const [generating, setGenerating] = useState(false);
  const [quotes, setQuotes] = useState<QuoteResult[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const { toast } = useToast();

  const generateQuote = useCallback(async (request: QuoteRequest) => {
    if (!request.materials?.length || !request.quantity) {
      toast({
        variant: "destructive",
        title: "Invalid Request",
        description: "Please provide materials and quantity information.",
      });
      return null;
    }

    setGenerating(true);
    try {
      console.log("🧮 Starting quote generation:", request);
      
      const quote = await quoteEngine.generateQuote(request);
      setQuotes(prev => [...prev, quote]);
      
      toast({
        title: "Quote Generated",
        description: `Quote ready: $${quote.finalPrice} in ${quote.timeline} days`,
      });
      
      return quote;
    } catch (error) {
      console.error("❌ Quote generation failed:", error);
      
      toast({
        variant: "destructive",
        title: "Quote Generation Failed",
        description: "Unable to generate quote. Please try again.",
      });
      
      return null;
    } finally {
      setGenerating(false);
    }
  }, [toast]);

  const generateMultipleQuotes = useCallback(async (requests: QuoteRequest[]) => {
    setGenerating(true);
    const results: QuoteResult[] = [];
    
    try {
      for (const request of requests) {
        const quote = await quoteEngine.generateQuote(request);
        results.push(quote);
      }
      
      setQuotes(prev => [...prev, ...results]);
      
      // Generate comparison if we have multiple quotes
      if (results.length > 1) {
        const comp = await quoteEngine.compareQuotes(results);
        setComparison(comp);
      }
      
      toast({
        title: "Quotes Generated",
        description: `${results.length} quotes generated successfully`,
      });
      
      return results;
    } catch (error) {
      console.error("❌ Multiple quote generation failed:", error);
      
      toast({
        variant: "destructive",
        title: "Quote Generation Failed",
        description: "Unable to generate all quotes. Please try again.",
      });
      
      return [];
    } finally {
      setGenerating(false);
    }
  }, [toast]);

  const compareQuotes = useCallback(async (quotesToCompare?: QuoteResult[]) => {
    const quotesForComparison = quotesToCompare || quotes;
    
    if (quotesForComparison.length < 2) {
      toast({
        variant: "destructive",
        title: "Insufficient Quotes",
        description: "Need at least 2 quotes to compare.",
      });
      return null;
    }

    try {
      const comp = await quoteEngine.compareQuotes(quotesForComparison);
      setComparison(comp);
      
      toast({
        title: "Quotes Compared",
        description: "Quote comparison analysis is ready",
      });
      
      return comp;
    } catch (error) {
      console.error("❌ Quote comparison failed:", error);
      
      toast({
        variant: "destructive",
        title: "Comparison Failed",
        description: "Unable to compare quotes. Please try again.",
      });
      
      return null;
    }
  }, [quotes, toast]);

  const clearQuotes = useCallback(() => {
    setQuotes([]);
    setComparison(null);
  }, []);

  const removeQuote = useCallback((quoteId: string) => {
    setQuotes(prev => prev.filter(q => q.id !== quoteId));
    setComparison(null); // Reset comparison when quotes change
  }, []);

  return {
    generating,
    quotes,
    comparison,
    generateQuote,
    generateMultipleQuotes,
    compareQuotes,
    clearQuotes,
    removeQuote
  };
};