import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';

interface OrderMessageButtonProps {
  orderId: number;
  artisanId: string;
  quoteRequestId?: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const OrderMessageButton = ({ 
  orderId, 
  artisanId, 
  quoteRequestId,
  variant = 'outline',
  size = 'sm',
  className 
}: OrderMessageButtonProps) => {
  const { user } = useAuth();
  const { createConversation } = useConversations();

  const handleStartConversation = async () => {
    if (!user?.id) return;

    try {
      await createConversation.mutateAsync({
        participants: [artisanId],
        title: `Order #${orderId} Discussion`,
        conversationType: 'order',
        orderId,
        quoteRequestId,
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartConversation}
      disabled={createConversation.isPending}
      className={className}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      {createConversation.isPending ? 'Creating...' : 'Message'}
    </Button>
  );
};