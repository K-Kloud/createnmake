
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Paperclip, Send } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onReferenceImageUpload: (file: File | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const PromptInput = ({
  prompt,
  onPromptChange,
  onReferenceImageUpload,
  onGenerate,
  isGenerating,
  disabled = false
}: PromptInputProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Handle file change for reference image
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    
    if (selectedFile) {
      // Check file size (max 10MB)
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSizeInBytes) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }

      onReferenceImageUpload(selectedFile);
      setPopoverOpen(false);
      
      toast({
        title: "Reference image added",
        description: "Your reference image has been uploaded successfully.",
      });
    }
  };

  // Handle Enter key press to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isGenerating && !disabled) {
      e.preventDefault();
      onGenerate();
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Prompt</label>
      <div className="relative flex items-center bg-black/30 border border-white/10 rounded-lg overflow-hidden">
        <Input 
          value={prompt} 
          onChange={e => onPromptChange(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, create anything..." 
          disabled={isGenerating || disabled} 
          className="border-0 bg-transparent pr-24 focus-visible:ring-0 focus-visible:ring-offset-0 my-[24px] mx-0 px-0 py-0" 
        />
        <div className="absolute right-2 flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/20 hover:text-primary" disabled={isGenerating || disabled}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4">
                    <label htmlFor="prompt-file-upload" className={`
                        flex flex-col items-center justify-center cursor-pointer
                        ${isGenerating || disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Add reference image</span>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                      <input 
                        id="prompt-file-upload" 
                        name="prompt-file-upload" 
                        type="file" 
                        accept="image/*" 
                        className="sr-only" 
                        onChange={handleFileChange} 
                        disabled={isGenerating || disabled} 
                      />
                    </label>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Add reference image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/20 hover:text-primary" disabled={isGenerating || disabled}>
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
