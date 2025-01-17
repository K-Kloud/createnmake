import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { MinimizeIcon, X } from "lucide-react";

interface ChatHeaderProps {
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatHeader = ({ onMinimize, onClose }: ChatHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
      <CardTitle className="text-sm font-medium">Chat Support</CardTitle>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onMinimize}
        >
          <MinimizeIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};