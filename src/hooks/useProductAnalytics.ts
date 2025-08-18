import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ProductAnalytics {
  totalProducts: number;
  totalViews: number;
  totalLikes: number;
  conversionRate: number;
  topPerformers: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    price: string;
    revenue: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  performanceMetrics: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
}

export const useProductAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['product-analytics', user?.id],
    queryFn: async (): Promise<ProductAnalytics> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: products } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_public', true);

      if (!products) return {
        totalProducts: 0,
        totalViews: 0,
        totalLikes: 0,
        conversionRate: 0,
        topPerformers: [],
        categoryBreakdown: [],
        performanceMetrics: []
      };

      const totalProducts = products.length;
      const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalLikes = products.reduce((sum, p) => sum + (p.likes || 0), 0);

      // Calculate conversion rate (simplified: likes/views ratio)
      const conversionRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

      // Top performers
      const topPerformers = products
        .filter(p => p.price)
        .map(p => {
          const engagementScore = (p.likes || 0) + (p.views || 0) * 0.1;
          const estimatedSales = Math.floor(engagementScore / 50);
          const revenue = estimatedSales * parseFloat(p.price || '0');
          
          return {
            id: p.id.toString(),
            title: p.title || p.prompt?.substring(0, 30) || 'Untitled',
            views: p.views || 0,
            likes: p.likes || 0,
            price: p.price || '0',
            revenue
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Category breakdown (extract from prompts)
      const categoryMap = new Map<string, { count: number; revenue: number }>();
      
      products.forEach(p => {
        const prompt = p.prompt?.toLowerCase() || '';
        let category = 'Other';
        
        if (prompt.includes('clothing') || prompt.includes('fashion') || prompt.includes('shirt') || prompt.includes('dress')) {
          category = 'Clothing';
        } else if (prompt.includes('art') || prompt.includes('painting') || prompt.includes('design')) {
          category = 'Art & Design';
        } else if (prompt.includes('home') || prompt.includes('furniture') || prompt.includes('decor')) {
          category = 'Home & Decor';
        } else if (prompt.includes('tech') || prompt.includes('gadget') || prompt.includes('electronic')) {
          category = 'Technology';
        }

        const existing = categoryMap.get(category) || { count: 0, revenue: 0 };
        const engagementScore = (p.likes || 0) + (p.views || 0) * 0.1;
        const estimatedSales = Math.floor(engagementScore / 50);
        const revenue = estimatedSales * parseFloat(p.price || '0');
        
        categoryMap.set(category, {
          count: existing.count + 1,
          revenue: existing.revenue + revenue
        });
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        ...data
      }));

      // Performance metrics
      const avgViews = totalProducts > 0 ? totalViews / totalProducts : 0;
      const avgLikes = totalProducts > 0 ? totalLikes / totalProducts : 0;
      const totalRevenue = topPerformers.reduce((sum, p) => sum + p.revenue, 0);

      const performanceMetrics = [
        { metric: 'Avg Views per Product', value: Math.round(avgViews), change: 12 },
        { metric: 'Avg Likes per Product', value: Math.round(avgLikes), change: 8 },
        { metric: 'Total Revenue', value: Math.round(totalRevenue), change: 15 },
        { metric: 'Engagement Rate', value: Math.round(conversionRate * 100) / 100, change: -2 }
      ];

      return {
        totalProducts,
        totalViews,
        totalLikes,
        conversionRate,
        topPerformers,
        categoryBreakdown,
        performanceMetrics
      };
    },
    enabled: !!user?.id,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
};