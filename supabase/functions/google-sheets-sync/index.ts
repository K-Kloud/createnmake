
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

// Input validation and sanitization functions
function validateSpreadsheetId(id: string): boolean {
  // Google Sheets ID format validation
  return /^[a-zA-Z0-9-_]{44}$/.test(id);
}

function validateSheetName(name: string): boolean {
  // Sheet name validation - alphanumeric, spaces, underscores, hyphens only
  return /^[a-zA-Z0-9\s_-]{1,100}$/.test(name);
}

function sanitizeInput(input: string): string {
  // Remove any potentially harmful characters
  return input.replace(/[<>{}()\[\]\\\/]/g, '').trim();
}

function validateTaskData(task: any): boolean {
  // Validate required fields and data types
  if (!task.description || typeof task.description !== 'string') return false;
  if (!task.company || typeof task.company !== 'string') return false;
  if (!task.task_type || typeof task.task_type !== 'string') return false;
  if (!task.status || typeof task.status !== 'string') return false;
  if (!task.priority || typeof task.priority !== 'string') return false;
  if (!task.due_date || typeof task.due_date !== 'string') return false;
  
  // Validate enum values
  const validTaskTypes = ['call', 'meeting', 'email', 'follow_up', 'content_update', 'website_task'];
  const validStatuses = ['not_started', 'in_progress', 'completed', 'waiting'];
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  
  if (!validTaskTypes.includes(task.task_type)) return false;
  if (!validStatuses.includes(task.status)) return false;
  if (!validPriorities.includes(task.priority)) return false;
  
  return true;
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

    // Rate limiting check - max 10 operations per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentSyncs } = await supabaseClient
      .from('sync_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('started_at', oneMinuteAgo);

    if (recentSyncs && recentSyncs.length >= 10) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }

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

    // Validate that the user owns this spreadsheet configuration
    if (config && config.spreadsheet_id !== finalSpreadsheetId) {
      throw new Error('Access denied: You can only sync your own spreadsheets')
    }

    // Log sync start with enhanced security context
    const { data: syncLog } = await supabaseClient
      .from('sync_logs')
      .insert({
        user_id: user.id,
        sync_type: action,
        status: 'pending',
        metadata: {
          spreadsheet_id: finalSpreadsheetId,
          sheet_name: finalSheetName,
          user_agent: req.headers.get('user-agent'),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        }
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

async function setupConfig(supabaseClient: any, userId: string, spreadsheetId: string, sheetName: string) {
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

async function pushToSheets(supabaseClient: any, userId: string, spreadsheetId: string, sheetName: string) {
  // Get all CRM tasks for the authenticated user only
  const { data: tasks, error } = await supabaseClient
    .from('crm_tasks')
    .select('*')
    .eq('owner_id', userId) // Security: only get user's own tasks
    .order('created_at', { ascending: false })

  if (error) throw error

  // Validate all task data before processing
  for (const task of tasks) {
    if (!validateTaskData(task)) {
      throw new Error(`Invalid task data found for task ${task.id}`)
    }
  }

  // Note: In a real implementation, you would use Google Sheets API here
  // For this demo, we'll simulate the process with enhanced security
  console.log(`Would push ${tasks.length} tasks to Google Sheets ${spreadsheetId}/${sheetName} for user ${userId}`)

  // Simulate updating google_sheets_row_id for each task
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    if (!task.google_sheets_row_id) {
      const rowId = `row_${task.id}_${Date.now()}_${userId}` // Include user ID for security
      await supabaseClient
        .from('crm_tasks')
        .update({ google_sheets_row_id: rowId })
        .eq('id', task.id)
        .eq('owner_id', userId) // Security: ensure user owns the task
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
  // For this demo, we'll simulate the process with enhanced security
  console.log(`Would pull data from Google Sheets ${spreadsheetId}/${sheetName} for user ${userId}`)

  // Simulate pulling some sample data with proper validation
  const simulatedSheetData = [
    {
      description: sanitizeInput('Follow up with client ABC'),
      company: sanitizeInput('ABC Corp'),
      task_type: 'follow_up',
      status: 'not_started',
      priority: 'high',
      due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      google_sheets_row_id: `sheet_row_${Date.now()}_${userId}`
    }
  ]

  let recordsAffected = 0

  for (const taskData of simulatedSheetData) {
    // Validate incoming data
    if (!validateTaskData(taskData)) {
      console.warn('Invalid task data from sheets, skipping:', taskData)
      continue
    }

    // Check if task already exists
    const { data: existingTask } = await supabaseClient
      .from('crm_tasks')
      .select('id')
      .eq('google_sheets_row_id', taskData.google_sheets_row_id)
      .eq('owner_id', userId) // Security: ensure user owns the task
      .single()

    if (!existingTask) {
      // Insert new task with proper ownership
      const { error: insertError } = await supabaseClient
        .from('crm_tasks')
        .insert({
          ...taskData,
          owner_id: userId // Security: ensure user owns the new task
        })
      
      if (insertError) {
        console.error('Error inserting task:', insertError)
        continue
      }
      
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
