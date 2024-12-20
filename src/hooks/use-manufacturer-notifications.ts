import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useManufacturerNotifications = () => {
  const { toast } = useToast();

  const notifyManufacturer = async (
    manufacturerId: string,
    title: string,
    message: string,
    type: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('notify-manufacturer', {
        body: {
          manufacturerId,
          title,
          message,
          type,
        },
      });

      if (error) throw error;

      toast({
        title: "Notification sent",
        description: "The manufacturer has been notified.",
      });
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { notifyManufacturer };
};