
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const PromptInput = ({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  disabled = false
}: PromptInputProps) => {

  // Handle Enter key press to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isGenerating && !disabled) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Create-2-Make with AI</label>
      <div className="relative flex items-center bg-black/30 border border-white/10 rounded-lg overflow-hidden px-[14px] my-0 mx-0 py-[10px]">
        <Input 
          value={prompt} 
          onChange={(e) => onPromptChange(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, create anything..." 
          disabled={isGenerating || disabled} 
          className="border-0 bg-transparent pr-24 focus-visible:ring-0 focus-visible:ring-offset-0 my-[24px] mx-0 px-0 py-0" 
        />
        <div className="absolute right-2 flex items-center space-x-1">
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/20 hover:text-primary" 
                  disabled={isGenerating || disabled}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Voice input (coming soon)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={onGenerate} 
            disabled={isGenerating || disabled || !prompt.trim()}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
