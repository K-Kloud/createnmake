
export interface SyncLog {
  id: number;
  sync_type: string;
  status: string;
  records_affected: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface GoogleSheetsConfig {
  id: number;
  spreadsheet_id: string;
  sheet_name: string;
  last_sync_at?: string;
  sync_enabled: boolean;
}
