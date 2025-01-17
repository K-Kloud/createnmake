import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput = ({ inputMessage, onInputChange, onSend, isLoading }: ChatInputProps) => {
  return (
    <div className="flex w-full gap-2">
      <Input
        placeholder="Type your message..."
        value={inputMessage}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        disabled={isLoading}
      />
      <Button size="icon" onClick={onSend} disabled={isLoading}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};