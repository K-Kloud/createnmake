import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";

export interface Task {
  id: number;
  description: string;
  company: string;
  task_type: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'waiting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  assignees: Array<{
    initials: string;
    color?: string;
  }>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'waiting':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-blue-500';
    default:
      return 'bg-green-500';
  }
};

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox />
          </TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Companies</TableHead>
          <TableHead>Task Type</TableHead>
          <TableHead>Task Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Task Date</TableHead>
          <TableHead>Task Owner</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>{task.description}</TableCell>
            <TableCell>{task.company}</TableCell>
            <TableCell>{task.task_type}</TableCell>
            <TableCell>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(task.status)} text-white`}
              >
                {task.status.replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge 
                variant="secondary"
                className={`${getPriorityColor(task.priority)} text-white`}
              >
                {task.priority}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <div className="flex -space-x-2">
                {task.assignees.map((assignee, index) => (
                  <Avatar
                    key={index}
                    className={`border-2 border-background ${assignee.color || 'bg-blue-500'}`}
                  >
                    <AvatarFallback>{assignee.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};