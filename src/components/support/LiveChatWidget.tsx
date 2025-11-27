import { useState } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

export const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! How can we help you today?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Save message to database
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase
        .from('contact_submissions')
        .insert({
          name: session?.user?.user_metadata?.username || 'Chat User',
          email: session?.user?.email || 'chat@temp.com',
          subject: 'Live Chat Message',
          message: inputMessage,
          status: 'new',
          user_id: session?.user?.id
        });

      // Simulate support response
      setTimeout(() => {
        const supportResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thanks for reaching out! Our support team will get back to you shortly. Estimated response time: 2-4 hours.',
          sender: 'support',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, supportResponse]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[hsl(var(--acid-lime))] text-black p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
        aria-label="Open live chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 w-96 shadow-2xl border-[hsl(var(--acid-lime))]/20 transition-all",
      isMinimized ? "h-16" : "h-[500px]"
    )}>
      {/* Header */}
      <div className="bg-[hsl(var(--acid-lime))] text-black px-4 py-3 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold">
              Live Support
            </h3>
            <p className="text-[10px] font-mono uppercase tracking-wider opacity-80">
              Avg Response: 2-4h
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-black/10 p-1 rounded transition-colors"
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-black/10 p-1 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[360px] bg-background">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2 rounded-lg",
                    message.sender === 'user'
                      ? "bg-[hsl(var(--acid-lime))] text-black"
                      : "bg-card border border-border"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-[10px] mt-1 opacity-60 font-mono">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border border-border px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-[hsl(var(--acid-lime))] text-black hover:bg-[hsl(var(--acid-lime))]/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
