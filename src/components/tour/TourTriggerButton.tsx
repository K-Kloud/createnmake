import { Button } from '@/components/ui/button';
import { HelpCircle, PlayCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProductTour } from '@/hooks/useProductTour';

export const TourTriggerButton = () => {
  const { startTour } = useProductTour();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden md:inline">Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={startTour} className="gap-2 cursor-pointer">
          <PlayCircle className="h-4 w-4" />
          <div>
            <div className="font-medium">Start Product Tour</div>
            <div className="text-xs text-muted-foreground">Learn platform features</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
