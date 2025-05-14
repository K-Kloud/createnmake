
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CRMTask } from "@/types/crm";
import { useMediaQuery } from "@/hooks/use-mobile";

interface TaskListProps {
  tasks: CRMTask[];
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

export const TaskList = ({ tasks }: TaskListProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Checkbox id={`task-${task.id}`} />
                <div>
                  <h3 className="font-medium">{task.description}</h3>
                  <p className="text-sm text-muted-foreground">{task.company}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={`${getStatusColor(task.status)} text-white`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={`${getPriorityColor(task.priority)} text-white`}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline">{task.task_type.replace('_', ' ')}</Badge>
              </div>
              <div className="flex -space-x-2">
                {task.assignees?.map((assignee, index) => (
                  <Avatar
                    key={index}
                    className={`border-2 border-background ${assignee.color || 'bg-blue-500'}`}
                  >
                    <AvatarFallback>{assignee.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
          <TableHead>Due Date</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead className="w-[80px]"></TableHead>
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
            <TableCell>{task.task_type.replace('_', ' ')}</TableCell>
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
                {task.assignees?.map((assignee, index) => (
                  <Avatar
                    key={index}
                    className={`border-2 border-background ${assignee.color || 'bg-blue-500'}`}
                  >
                    <AvatarFallback>{assignee.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
