import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const ContextualHelp = () => {
  const location = useLocation();
  const [dismissedTooltips, setDismissedTooltips] = useState<Set<string>>(new Set());

  const { data: tooltips } = useQuery({
    queryKey: ["help-tooltips", location.pathname],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("help_tooltips")
        .select("*")
        .eq("page_path", location.pathname)
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Clear dismissed tooltips when navigating to a new page
    setDismissedTooltips(new Set());
  }, [location.pathname]);

  if (!tooltips || tooltips.length === 0) return null;

  const activeTooltips = tooltips.filter((t) => !dismissedTooltips.has(t.id));

  return (
    <>
      {activeTooltips.map((tooltip) => {
        const element = document.querySelector(tooltip.element_selector);
        if (!element) return null;

        return (
          <ContextualTooltip
            key={tooltip.id}
            tooltip={tooltip}
            onDismiss={() => {
              setDismissedTooltips((prev) => new Set([...prev, tooltip.id]));
            }}
          />
        );
      })}
    </>
  );
};

interface ContextualTooltipProps {
  tooltip: any;
  onDismiss: () => void;
}

const ContextualTooltip = ({ tooltip, onDismiss }: ContextualTooltipProps) => {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="fixed z-50"
      style={{
        // Position the tooltip near the target element
        // This is a simplified version - in production you'd calculate exact positions
        bottom: "20px",
        right: "20px",
      }}
      role="dialog"
      aria-labelledby={`tooltip-${tooltip.id}`}
      aria-describedby={`tooltip-desc-${tooltip.id}`}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="rounded-full bg-acid-lime text-void-black hover:bg-acid-lime/90 shadow-lg animate-pulse"
            aria-label="View contextual help"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side={tooltip.position || "top"}
          className="border-ghost-white/20 bg-void-black/95 backdrop-blur-xl p-4 max-w-sm"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <HelpCircle className="h-5 w-5 text-acid-lime flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p id={`tooltip-desc-${tooltip.id}`} className="text-sm text-ghost-white leading-relaxed">
                  {tooltip.tooltip_text}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setOpen(false);
                  onDismiss();
                }}
                className="h-6 w-6 text-slate-400 hover:text-ghost-white flex-shrink-0"
                aria-label="Dismiss help tooltip"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  onDismiss();
                }}
                className="text-xs text-slate-400 hover:text-acid-lime"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
