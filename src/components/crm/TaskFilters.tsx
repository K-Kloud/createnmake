
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskFilter } from "@/types/crm";
import { sanitizeHtml } from "@/utils/security";

interface TaskFiltersProps {
  onFilterChange: (filters: Partial<TaskFilter>) => void;
}

export const TaskFilters = ({ onFilterChange }: TaskFiltersProps) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeHtml(e.target.value);
    onFilterChange({ search: sanitized });
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-8"
          onChange={handleSearchChange}
          maxLength={100}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Select onValueChange={(value) => onFilterChange({ taskType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Task type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="follow_up">Follow up</SelectItem>
            <SelectItem value="website_task">Website</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={(value) => onFilterChange({ status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="not_started">Not started</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={(value) => onFilterChange({ priority: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={(value) => onFilterChange({ timeFilter: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This week</SelectItem>
            <SelectItem value="this_month">This month</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
