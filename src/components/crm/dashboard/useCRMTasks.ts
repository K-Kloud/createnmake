
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CRMTask, TaskStats } from "@/types/crm";
import { useState } from "react";

export const useCRMTasks = () => {
  const [filterValues, setFilterValues] = useState({});
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['crm-tasks', filterValues],
    queryFn: async (): Promise<CRMTask[]> => {
      let query = supabase
        .from('crm_tasks')
        .select(`
          id,
          description,
          company,
          task_type,
          status,
          priority,
          due_date,
          assignee_id,
          owner_id
        `)
        .order('due_date', { ascending: true });
      
      // Apply filters if they exist
      if (filterValues) {
        if (filterValues['search']) {
          query = query.ilike('description', `%${filterValues['search']}%`);
        }
        if (filterValues['taskType'] && filterValues['taskType'] !== 'all') {
          query = query.eq('task_type', filterValues['taskType']);
        }
        if (filterValues['status'] && filterValues['status'] !== 'all') {
          query = query.eq('status', filterValues['status']);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(task => ({
        id: String(task.id),
        description: task.description,
        company: task.company,
        task_type: task.task_type as CRMTask['task_type'],
        status: task.status as CRMTask['status'],
        priority: task.priority as CRMTask['priority'],
        due_date: task.due_date,
        assignees: [{ initials: 'AI', color: 'bg-blue-500' }],
      }));
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['crm-stats', tasks],
    queryFn: (): TaskStats => {
      if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 };
      
      const now = new Date();
      const completed = tasks.filter(t => t.status === 'completed').length;
      const overdue = tasks.filter(t => 
        t.status !== 'completed' && new Date(t.due_date) < now
      ).length;
      const pending = tasks.filter(t => 
        t.status !== 'completed' && new Date(t.due_date) >= now
      ).length;
      
      return {
        total: tasks.length,
        completed,
        pending,
        overdue
      };
    },
    enabled: !!tasks
  });

  return {
    tasks,
    stats,
    isLoading,
    filterValues,
    setFilterValues
  };
};
