import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFiltersProps {
  onFilterChange: (filters: any) => void;
}

export const TaskFilters = ({ onFilterChange }: TaskFiltersProps) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-8"
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
      <Select onValueChange={(value) => onFilterChange({ taskType: value })}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All tasks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tasks</SelectItem>
          <SelectItem value="call">Call</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="follow_up">Follow up</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => onFilterChange({ team: value })}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All teams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All teams</SelectItem>
          <SelectItem value="sales">Sales Team</SelectItem>
          <SelectItem value="support">Support Team</SelectItem>
          <SelectItem value="marketing">Marketing Team</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => onFilterChange({ timeFilter: value })}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Time filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this_week">This week</SelectItem>
          <SelectItem value="this_month">This month</SelectItem>
          <SelectItem value="this_quarter">This quarter</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};