
import { GoogleSheetsConfiguration } from "./google-sheets/GoogleSheetsConfiguration";
import { SyncActions } from "./google-sheets/SyncActions";
import { SyncHistory } from "./google-sheets/SyncHistory";
import { useGoogleSheetsData } from "./google-sheets/hooks/useGoogleSheetsData";

export const GoogleSheetsSync = () => {
  const { config, configLoading, syncLogs, logsLoading } = useGoogleSheetsData();

  return (
    <div className="space-y-6">
      <GoogleSheetsConfiguration config={config} configLoading={configLoading} />
      
      {config && <SyncActions config={config} />}
      
      <SyncHistory syncLogs={syncLogs} logsLoading={logsLoading} />
    </div>
  );
};
