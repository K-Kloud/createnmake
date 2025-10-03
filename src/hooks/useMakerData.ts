
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
      
      // For security: only select safe, non-sensitive fields for public viewing
      // Handle manufacturers and profiles separately due to different schemas
      let data: any;
      let error: any;
      
      if (makerType === 'manufacturer') {
        // Excludes sensitive fields: contact_email, phone, address
        const result = await supabase
          .from('manufacturers')
          .select('id,business_name,business_type,specialties,is_verified,created_at,updated_at,website,description')
          .eq('id', id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      } else {
        // Excludes sensitive fields: phone, address, first_name, last_name, hourly_rate
        const result = await supabase
          .from('profiles')
          .select('id,username,display_name,bio,avatar_url,website,location,social_links,created_at,updated_at,business_name,business_type,specialties,is_artisan,is_creator')
          .eq('id', id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }
      
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
