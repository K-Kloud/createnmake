
// Security utilities for rate limiting and access control
export async function checkRateLimit(supabaseClient: any, userId: string): Promise<void> {
  // Rate limiting check - max 10 operations per minute per user
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { data: recentSyncs } = await supabaseClient
    .from('sync_logs')
    .select('id')
    .eq('user_id', userId)
    .gte('started_at', oneMinuteAgo);

  if (recentSyncs && recentSyncs.length >= 10) {
    throw new Error('Rate limit exceeded. Please wait before trying again.')
  }
}

export async function verifySpreadsheetAccess(
  supabaseClient: any, 
  userId: string, 
  spreadsheetId: string
): Promise<void> {
  // Get Google Sheets config to verify ownership
  const { data: config } = await supabaseClient
    .from('google_sheets_config')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Validate that the user owns this spreadsheet configuration
  if (config && config.spreadsheet_id !== spreadsheetId) {
    throw new Error('Access denied: You can only sync your own spreadsheets')
  }
}

export async function logSyncOperation(
  supabaseClient: any,
  userId: string,
  action: string,
  spreadsheetId: string,
  sheetName: string,
  req: Request
) {
  return await supabaseClient
    .from('sync_logs')
    .insert({
      user_id: userId,
      sync_type: action,
      status: 'pending',
      metadata: {
        spreadsheet_id: spreadsheetId,
        sheet_name: sheetName,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      }
    })
    .select()
    .single()
}
