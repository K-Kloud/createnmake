import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface ImageFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ImageFilters = ({ searchTerm, onSearchChange }: ImageFiltersProps) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by title, prompt, or creator..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        Filter
      </Button>
    </div>
  );
};