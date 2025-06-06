
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, RefreshCw, ExternalLink } from "lucide-react";
import { GoogleSheetsConfig } from "./types";

interface GoogleSheetsConfigurationProps {
  config: GoogleSheetsConfig | null;
  configLoading: boolean;
}

export const GoogleSheetsConfiguration = ({ config, configLoading }: GoogleSheetsConfigurationProps) => {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("CRM Tasks");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Setup config mutation
  const setupConfigMutation = useMutation({
    mutationFn: async ({ spreadsheetId, sheetName }: { spreadsheetId: string; sheetName: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('google-sheets-sync', {
        body: {
          action: 'setup_config',
          spreadsheetId,
          sheetName
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "Google Sheets configuration has been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['google-sheets-config'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSetupConfig = () => {
    if (!spreadsheetId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a Google Sheets ID.",
        variant: "destructive"
      });
      return;
    }
    setupConfigMutation.mutate({ spreadsheetId: spreadsheetId.trim(), sheetName });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Google Sheets Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {config ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Connected to spreadsheet: <code className="bg-muted px-2 py-1 rounded">{config.spreadsheet_id}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Sheet name: <code className="bg-muted px-2 py-1 rounded">{config.sheet_name}</code>
            </p>
            {config.last_sync_at && (
              <p className="text-sm text-muted-foreground">
                Last sync: {new Date(config.last_sync_at).toLocaleString()}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${config.spreadsheet_id}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Sheets
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Google Sheets ID</label>
              <Input
                placeholder="Enter your Google Sheets ID"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can find this in your Google Sheets URL: docs.google.com/spreadsheets/d/[SHEETS_ID]/edit
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Sheet Name</label>
              <Input
                placeholder="Sheet name (e.g., CRM Tasks)"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleSetupConfig}
              disabled={setupConfigMutation.isPending}
            >
              {setupConfigMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
