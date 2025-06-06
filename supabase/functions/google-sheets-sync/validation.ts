
// Input validation and sanitization functions
export function validateSpreadsheetId(id: string): boolean {
  // Google Sheets ID format validation
  return /^[a-zA-Z0-9-_]{44}$/.test(id);
}

export function validateSheetName(name: string): boolean {
  // Sheet name validation - alphanumeric, spaces, underscores, hyphens only
  return /^[a-zA-Z0-9\s_-]{1,100}$/.test(name);
}

export function sanitizeInput(input: string): string {
  // Remove any potentially harmful characters
  return input.replace(/[<>{}()\[\]\\\/]/g, '').trim();
}

export function validateTaskData(task: any): boolean {
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
