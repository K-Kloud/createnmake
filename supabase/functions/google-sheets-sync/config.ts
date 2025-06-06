
import { sanitizeInput, validateSpreadsheetId, validateSheetName } from './validation.ts'

export async function setupConfig(
  supabaseClient: any, 
  userId: string, 
  spreadsheetId: string, 
  sheetName: string
) {
  // Additional validation for setup
  if (!validateSpreadsheetId(spreadsheetId)) {
    throw new Error('Invalid spreadsheet ID format for setup')
  }

  if (!validateSheetName(sheetName)) {
    throw new Error('Invalid sheet name format for setup')
  }

  // Upsert Google Sheets config
  const { data, error } = await supabaseClient
    .from('google_sheets_config')
    .upsert({
      user_id: userId,
      spreadsheet_id: sanitizeInput(spreadsheetId),
      sheet_name: sanitizeInput(sheetName),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()

  if (error) throw error

  return { message: 'Configuration saved successfully', config: data }
}
