
export interface CRMTask {
  id: string;
  description: string;
  company: string;
  task_type: 'call' | 'meeting' | 'email' | 'follow_up' | 'content_update' | 'website_task';
  status: 'not_started' | 'in_progress' | 'completed' | 'waiting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  assignees?: Assignee[]; // Added assignees property
  assignee_id?: string;
  owner_id?: string;
  related_to?: string;
  notes?: string;
}

export interface Assignee {
  id?: string;
  initials: string;
  name?: string;
  color?: string;
}

export interface TaskFilter {
  search?: string;
  taskType?: string;
  team?: string;
  timeFilter?: string;
  status?: string;
  priority?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
