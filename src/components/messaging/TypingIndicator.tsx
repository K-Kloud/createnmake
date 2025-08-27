import { useEffect, useState } from 'react';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';

interface TypingIndicatorProps {
  conversationId: string;
}

export const TypingIndicator = ({ conversationId }: TypingIndicatorProps) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { activeUsers } = useRealtimeCollaboration(`typing:${conversationId}`);

  useEffect(() => {
    // Filter active users who are currently typing
    const typing = activeUsers
      .filter(user => user.cursor) // Using cursor as typing indicator
      .map(user => user.name)
      .filter(Boolean);
    
    setTypingUsers(typing);
  }, [activeUsers]);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    }
    return `${typingUsers.length} people are typing...`;
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};