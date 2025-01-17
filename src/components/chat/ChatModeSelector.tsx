import { Button } from "@/components/ui/button";
import { Factory, HeadphonesIcon } from "lucide-react";

interface ChatModeSelectorProps {
  chatMode: "customer" | "manufacturer";
  onModeChange: (mode: "customer" | "manufacturer") => void;
}

export const ChatModeSelector = ({ chatMode, onModeChange }: ChatModeSelectorProps) => {
  return (
    <div className="p-4 border-t border-border">
      <div className="flex gap-2">
        <Button
          variant={chatMode === "customer" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => onModeChange("customer")}
        >
          <HeadphonesIcon className="mr-2 h-4 w-4" />
          Customer Care
        </Button>
        <Button
          variant={chatMode === "manufacturer" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => onModeChange("manufacturer")}
        >
          <Factory className="mr-2 h-4 w-4" />
          Manufacturer
        </Button>
      </div>
    </div>
  );
};