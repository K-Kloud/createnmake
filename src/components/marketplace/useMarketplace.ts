import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useMarketplaceImages } from "./hooks/useMarketplaceImages";
import { useLikeMutation } from "./hooks/useLikeMutation";
import { useViewMutation } from "./hooks/useViewMutation";

export const useMarketplace = () => {
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: images, isLoading } = useMarketplaceImages(session?.user?.id);
  const likeMutation = useLikeMutation(images);
  const viewMutation = useViewMutation(images);

  return {
    session,
    images,
    isLoading,
    likeMutation,
    viewMutation,
    toast
  };
};