import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { generateRandomPrice } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const useImageCard = (image, onView) => {
  const [currentPrice, setCurrentPrice] = useState(image.price || generateRandomPrice(image.id));
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUser(data.session.user.id);
      }
    };
    checkUser();
  }, []);

  const isCreator = currentUser === image.user_id;

  const handleImageClick = () => {
    // Record view
    onView(image.id);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
    return zoomLevel;
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    return zoomLevel;
  };

  const handleMakeSelection = (type: 'artisan' | 'manufacturer') => {
    localStorage.setItem('selectedDesignImage', JSON.stringify({
      url: image.url,
      prompt: image.prompt,
      id: image.id
    }));
    
    toast({
      title: "Design Selected",
      description: `Redirecting to ${type} selection...`,
    });

    navigate(type === 'artisan' ? '/artisan' : '/manufacturer');
  };

  const handlePriceChange = async (newPrice: string) => {
    setCurrentPrice(newPrice);
    
    toast({
      title: "Price Updated",
      description: `Price has been updated to ${newPrice}`,
    });
    
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ price: newPrice })
        .eq('id', image.id);
        
      if (error) {
        console.error('Error updating price:', error);
        toast({
          title: "Error",
          description: "Failed to update price in database",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Exception updating price:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    currentPrice,
    currentUser,
    isCreator,
    handleImageClick,
    handleZoomIn,
    handleZoomOut,
    zoomLevel,
    handleMakeSelection,
    handlePriceChange
  };
};
