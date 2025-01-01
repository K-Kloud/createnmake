import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const useImageGeneration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleHomeClick = () => {
    navigate("/");
  };

  return {
    loading,
    image,
    error,
    setLoading,
    setImage,
    setError,
    HomeButton: () => (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleHomeClick}
        className="absolute top-4 left-4"
      >
        <Home className="h-5 w-5" />
      </Button>
    ),
  };
};
