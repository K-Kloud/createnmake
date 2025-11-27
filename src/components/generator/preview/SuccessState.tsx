import { CheckCircle2, Download, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SuccessStateProps {
  onDismiss?: () => void;
}

export const SuccessState = ({ onDismiss }: SuccessStateProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onDismiss?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="text-center space-y-4 animate-in zoom-in duration-300">
        <div className="relative mx-auto w-fit">
          <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="size-12 text-primary" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 size-6 text-primary animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Design Complete!</h3>
          <p className="text-sm text-white/80">Your creation is ready</p>
        </div>
      </div>
    </div>
  );
};
