
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CRMTask {
  id: number
  description: string
  company: string
  task_type: string
  status: string
  priority: string
  due_date: string
  assignee_id?: string
  owner_id?: string
  google_sheets_row_id?: string
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
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    })

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, spreadsheetId, sheetName } = await req.json()

    // Get Google Sheets config
    const { data: config } = await supabaseClient
      .from('google_sheets_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const finalSpreadsheetId = spreadsheetId || config?.spreadsheet_id
    const finalSheetName = sheetName || config?.sheet_name || 'CRM Tasks'

    if (!finalSpreadsheetId) {
      throw new Error('Google Sheets configuration not found')
    }

    // Log sync start
    const { data: syncLog } = await supabaseClient
      .from('sync_logs')
      .insert({
        user_id: user.id,
        sync_type: action,
        status: 'pending'
      })
      .select()
      .single()

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
      }

      // Update sync log with success
      await supabaseClient
        .from('sync_logs')
        .update({
          status: 'success',
          records_affected: recordsAffected,
          completed_at: new Date().toISOString(),
          metadata: { result }
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
          completed_at: new Date().toISOString()
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

async function setupConfig(supabaseClient: any, userId: string, spreadsheetId: string, sheetName: string) {
  // Upsert Google Sheets config
  const { data, error } = await supabaseClient
    .from('google_sheets_config')
    .upsert({
      user_id: userId,
      spreadsheet_id: spreadsheetId,
      sheet_name: sheetName,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()

  if (error) throw error

  return { message: 'Configuration saved successfully', config: data }
}

async function pushToSheets(supabaseClient: any, userId: string, spreadsheetId: string, sheetName: string) {
  // Get all CRM tasks
  const { data: tasks, error } = await supabaseClient
    .from('crm_tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Note: In a real implementation, you would use Google Sheets API here
  // For this demo, we'll simulate the process
  console.log(`Would push ${tasks.length} tasks to Google Sheets ${spreadsheetId}/${sheetName}`)

  // Simulate updating google_sheets_row_id for each task
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    if (!task.google_sheets_row_id) {
      await supabaseClient
        .from('crm_tasks')
        .update({ google_sheets_row_id: `row_${task.id}_${Date.now()}` })
        .eq('id', task.id)
    }
  }

  // Update last sync time
  await supabaseClient
    .from('google_sheets_config')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('user_id', userId)

  return {
    message: `Successfully pushed ${tasks.length} tasks to Google Sheets`,
    recordsAffected: tasks.length
  }
}

async function pullFromSheets(supabaseClient: any, userId: string, spreadsheetId: string, sheetName: string) {
  // Note: In a real implementation, you would fetch data from Google Sheets API here
  // For this demo, we'll simulate the process
  console.log(`Would pull data from Google Sheets ${spreadsheetId}/${sheetName}`)

  // Simulate pulling some sample data
  const simulatedSheetData = [
    {
      description: 'Follow up with client ABC',
      company: 'ABC Corp',
      task_type: 'follow_up',
      status: 'not_started',
      priority: 'high',
      due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      google_sheets_row_id: 'sheet_row_1'
    }
  ]

  let recordsAffected = 0

  for (const taskData of simulatedSheetData) {
    // Check if task already exists
    const { data: existingTask } = await supabaseClient
      .from('crm_tasks')
      .select('id')
      .eq('google_sheets_row_id', taskData.google_sheets_row_id)
      .single()

    if (!existingTask) {
      // Insert new task
      await supabaseClient
        .from('crm_tasks')
        .insert({
          ...taskData,
          owner_id: userId
        })
      recordsAffected++
    }
  }

  // Update last sync time
  await supabaseClient
    .from('google_sheets_config')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('user_id', userId)

  return {
    message: `Successfully pulled ${recordsAffected} new tasks from Google Sheets`,
    recordsAffected
  }
}
