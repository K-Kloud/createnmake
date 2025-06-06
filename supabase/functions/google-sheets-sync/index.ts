
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateSpreadsheetId, validateSheetName, sanitizeInput } from './validation.ts'
import { checkRateLimit, verifySpreadsheetAccess, logSyncOperation } from './security.ts'
import { setupConfig } from './config.ts'
import { pushToSheets, pullFromSheets } from './sync-operations.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    })

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const requestBody = await req.json()
    const { action, spreadsheetId, sheetName } = requestBody

    // Input validation and sanitization
    if (spreadsheetId && !validateSpreadsheetId(spreadsheetId)) {
      throw new Error('Invalid spreadsheet ID format')
    }

    if (sheetName && !validateSheetName(sheetName)) {
      throw new Error('Invalid sheet name format')
    }

    // Rate limiting check
    await checkRateLimit(supabaseClient, user.id)

    // Get Google Sheets config
    const { data: config } = await supabaseClient
      .from('google_sheets_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const finalSpreadsheetId = spreadsheetId ? sanitizeInput(spreadsheetId) : config?.spreadsheet_id
    const finalSheetName = sheetName ? sanitizeInput(sheetName) : config?.sheet_name || 'CRM Tasks'

    if (!finalSpreadsheetId) {
      throw new Error('Google Sheets configuration not found')
    }

    // Verify spreadsheet access
    await verifySpreadsheetAccess(supabaseClient, user.id, finalSpreadsheetId)

    // Log sync start
    const { data: syncLog } = await logSyncOperation(
      supabaseClient, 
      user.id, 
      action, 
      finalSpreadsheetId, 
      finalSheetName, 
      req
    )

    let result
    let recordsAffected = 0

    try {
      if (action === 'push_to_sheets') {
        result = await pushToSheets(supabaseClient, user.id, finalSpreadsheetId, finalSheetName)
        recordsAffected = result.recordsAffected
      } else if (action === 'pull_from_sheets') {
        result = await pullFromSheets(supabaseClient, user.id, finalSpreadsheetId, finalSheetName)
        recordsAffected = result.recordsAffected
      } else if (action === 'setup_config') {
        result = await setupConfig(supabaseClient, user.id, finalSpreadsheetId, finalSheetName)
      } else {
        throw new Error('Invalid action')
      }

      // Update sync log with success
      await supabaseClient
        .from('sync_logs')
        .update({
          status: 'success',
          records_affected: recordsAffected,
          completed_at: new Date().toISOString(),
          metadata: { 
            ...syncLog.metadata,
            result,
            success: true
          }
        })
        .eq('id', syncLog.id)

      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (error) {
      // Update sync log with error
      await supabaseClient
        .from('sync_logs')
        .update({
          status: 'error',
          error_message: error.message,
          completed_at: new Date().toISOString(),
          metadata: {
            ...syncLog.metadata,
            error: error.message,
            success: false
          }
        })
        .eq('id', syncLog.id)

      throw error
    }

  } catch (error) {
    console.error('Error in google-sheets-sync:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
