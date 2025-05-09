
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CardTitle, CardDescription, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomerMessagesProps {
  customerId: string;
}

export const CustomerMessages = ({ customerId }: CustomerMessagesProps) => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['customer-messages', customerId],
    queryFn: async () => {
      // For now, just returning an empty array
      // In a real implementation, this would query messages
      return [];
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!messages?.length) {
    return (
      <Card className="p-8 text-center">
        <CardTitle className="mb-2">No Messages Yet</CardTitle>
        <CardDescription className="mb-6">
          When you interact with designers or place orders, your messages will appear here.
        </CardDescription>
        <Button onClick={() => window.location.href = '/marketplace'}>
          Browse Marketplace
        </Button>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Messages would be displayed here */}
      <p>You have {messages.length} messages.</p>
    </div>
  );
};
