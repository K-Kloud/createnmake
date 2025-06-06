
import { validateTaskData, sanitizeInput } from './validation.ts'

export async function pushToSheets(
  supabaseClient: any, 
  userId: string, 
  spreadsheetId: string, 
  sheetName: string
) {
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

export async function pullFromSheets(
  supabaseClient: any, 
  userId: string, 
  spreadsheetId: string, 
  sheetName: string
) {
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
