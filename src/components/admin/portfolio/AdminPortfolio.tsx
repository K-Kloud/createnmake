import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioList } from "@/components/admin/PortfolioList";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export const AdminPortfolio = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: portfolios, isLoading: portfoliosLoading } = useQuery({
    queryKey: ['adminPortfolios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturer_portfolios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('manufacturer_portfolios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPortfolios'] });
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete portfolio item: " + error.message,
        variant: "destructive",
      });
    }
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const { error } = await supabase
        .from('manufacturer_portfolios')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPortfolios'] });
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update portfolio item: " + error.message,
        variant: "destructive",
      });
    }
  });

  if (portfoliosLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <PortfolioList
      items={portfolios || []}
      onDelete={(id) => deletePortfolioMutation.mutate(id)}
      onUpdate={(id, data) => updatePortfolioMutation.mutate({ id, data })}
    />
  );
};