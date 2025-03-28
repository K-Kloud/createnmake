
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Icons";
import { useToast } from "@/components/ui/use-toast";
import { Phone } from "lucide-react";

interface SocialButtonsProps {
  onPhoneAuth: () => void;
}

export const SocialButtons = ({ onPhoneAuth }: SocialButtonsProps) => {
  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        variant="outline"
        onClick={onPhoneAuth}
      >
        <Phone className="mr-2 h-4 w-4" />
        Continue with Phone
      </Button>
    </div>
  );
};
