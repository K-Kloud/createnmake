import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Paperclip, Send, Sparkles } from "lucide-react";
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
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file.",
          variant: "destructive"
        });
        return;
      }
      onReferenceImageUpload(selectedFile);
      setPopoverOpen(false);
      toast({
        title: "Reference image added",
        description: "Your reference image has been uploaded successfully."
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
  return <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-foreground">
            Describe your vision
          </label>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative bg-background/80 backdrop-blur-sm border border-border/60 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
            <Input value={prompt} onChange={e => onPromptChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="A cozy living room with modern furniture, warm lighting, and plants..." disabled={isGenerating || disabled} className="border-0 text-base placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 pr-32 py-[60px] px-[15px] bg-gray-700" />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors" disabled={isGenerating || disabled}>
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-4 border-border/60 bg-background/95 backdrop-blur-sm">
                        <label htmlFor="prompt-file-upload" className={`flex flex-col items-center justify-center cursor-pointer py-6 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors ${isGenerating || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <ImageIcon className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-medium mb-1">Add reference image</span>
                          <p className="text-xs text-muted-foreground text-center">
                            PNG, JPG, GIF up to 10MB
                          </p>
                          <input id="prompt-file-upload" name="prompt-file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isGenerating || disabled} />
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
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors" disabled={isGenerating || disabled}>
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Voice input (coming soon)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary transition-colors" onClick={onGenerate} disabled={isGenerating || disabled || !prompt.trim()}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground/80 text-center">
          Be specific about colors, style, materials, and mood for best results
        </p>
      </div>
    </div>;
};