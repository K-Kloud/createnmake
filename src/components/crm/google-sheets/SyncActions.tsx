
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Upload, Download } from "lucide-react";
import { GoogleSheetsConfig } from "./types";

interface SyncActionsProps {
  config: GoogleSheetsConfig;
}

export const SyncActions = ({ config }: SyncActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync mutations
  const syncMutation = useMutation({
    mutationFn: async (action: 'push_to_sheets' | 'pull_from_sheets') => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('google-sheets-sync', {
        body: { action }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, action) => {
      const actionText = action === 'push_to_sheets' ? 'pushed to' : 'pulled from';
      toast({
        title: "Sync Successful",
        description: `Data has been successfully ${actionText} Google Sheets.`
      });
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Sync Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => syncMutation.mutate('push_to_sheets')}
            disabled={syncMutation.isPending}
            variant="outline"
          >
            {syncMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Push to Google Sheets
          </Button>
          <Button
            onClick={() => syncMutation.mutate('pull_from_sheets')}
            disabled={syncMutation.isPending}
            variant="outline"
          >
            {syncMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Pull from Google Sheets
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Push: Send your CRM tasks to Google Sheets | Pull: Import tasks from Google Sheets
        </p>
      </CardContent>
    </Card>
  );
};
