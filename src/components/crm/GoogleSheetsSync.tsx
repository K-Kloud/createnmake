
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  RefreshCw, 
  Upload, 
  Download, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SyncLog {
  id: number;
  sync_type: string;
  status: string;
  records_affected: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

interface GoogleSheetsConfig {
  id: number;
  spreadsheet_id: string;
  sheet_name: string;
  last_sync_at?: string;
  sync_enabled: boolean;
}

export const GoogleSheetsSync = () => {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("CRM Tasks");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
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

      {/* Sync Actions */}
      {config && (
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
      )}

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Loading sync history...</p>
            </div>
          ) : syncLogs && syncLogs.length > 0 ? (
            <div className="space-y-3">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="text-sm font-medium">
                        {log.sync_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.records_affected > 0 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {log.records_affected} records
                      </span>
                    )}
                    {getStatusBadge(log.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No sync history found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
