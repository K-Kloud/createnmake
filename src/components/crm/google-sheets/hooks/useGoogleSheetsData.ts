
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GoogleSheetsConfig, SyncLog } from "../types";

export const useGoogleSheetsData = () => {
  // Fetch Google Sheets config
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['google-sheets-config'],
    queryFn: async (): Promise<GoogleSheetsConfig | null> => {
      const { data, error } = await supabase
        .from('google_sheets_config')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Fetch sync logs
  const { data: syncLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['sync-logs'],
    queryFn: async (): Promise<SyncLog[]> => {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  return {
    config,
    configLoading,
    syncLogs,
    logsLoading
  };
};
