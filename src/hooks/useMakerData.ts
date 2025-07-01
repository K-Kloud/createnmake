
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Manufacturer, Artisan } from "@/types/maker";

export const useMakerData = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const makerType = searchParams.get('type');
  
  console.log('MakerDetail params:', { id, makerType });
  
  const { data: maker, isLoading, error } = useQuery({
    queryKey: ['maker', id, makerType],
    queryFn: async () => {
      if (!id) {
        console.log('No maker ID provided');
        return null;
      }
      
      console.log('Fetching maker:', { id, makerType });
      
      const tableName = makerType === 'manufacturer' ? 'manufacturers' : 'profiles';
      const query = supabase
        .from(tableName)
        .select('*')
        .eq('id', id);
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Error fetching maker details:', error);
        throw error;
      }
      
      console.log('Fetched maker data:', data);
      return data as Manufacturer | Artisan;
    },
    enabled: !!id && !!makerType,
  });

  return {
    maker,
    isLoading,
    error,
    makerId: id,
    makerType
  };
};
