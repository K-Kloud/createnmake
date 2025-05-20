
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";

interface ShortcutItemProps {
  keys: string[];
  description: string;
}

const ShortcutItem = ({ keys, description }: ShortcutItemProps) => (
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-muted-foreground">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <kbd 
          key={index} 
          className="px-2 py-1 text-xs font-semibold text-foreground bg-muted rounded border border-border"
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp = ({ isOpen, onClose }: KeyboardShortcutsHelpProps) => {
  const shortcuts = [
    { keys: ["Esc"], description: "Exit full screen or close dialog" },
    { keys: ["+"], description: "Zoom in" },
    { keys: ["-"], description: "Zoom out" },
    { keys: ["M"], description: "Toggle maximized mode" },
    { keys: ["P"], description: "Toggle prompt visibility" },
    { keys: ["D"], description: "Download image" },
    { keys: ["S"], description: "Share image" },
    { keys: ["Double Click"], description: "Like image" }
  ];

  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Keyboard Shortcuts</h4>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <ShortcutItem 
              key={index} 
              keys={shortcut.keys} 
              description={shortcut.description} 
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const KeyboardShortcutsButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="icon" className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Keyboard shortcuts</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                {[
                  { keys: ["Esc"], description: "Exit full screen or close dialog" },
                  { keys: ["+"], description: "Zoom in" },
                  { keys: ["-"], description: "Zoom out" },
                  { keys: ["M"], description: "Toggle maximized mode" },
                  { keys: ["P"], description: "Toggle prompt visibility" },
                  { keys: ["D"], description: "Download image" },
                  { keys: ["S"], description: "Share image" },
                  { keys: ["Double Click"], description: "Like image" }
                ].map((shortcut, index) => (
                  <ShortcutItem 
                    key={index} 
                    keys={shortcut.keys} 
                    description={shortcut.description} 
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Keyboard shortcuts</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
