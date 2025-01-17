import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatModeSelector } from "./chat/ChatModeSelector";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatInput } from "./chat/ChatInput";

type ChatMode = "customer" | "manufacturer";

interface Message {
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatMode, setChatMode] = useState<ChatMode>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: inputMessage, chatMode }
      });

      if (error) throw error;

      const botMessage: Message = {
        text: data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 p-0"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg glass-card transition-all duration-300 ease-in-out">
      <ChatHeader 
        onMinimize={() => setIsMinimized(!isMinimized)} 
        onClose={() => setIsOpen(false)} 
      />

      {!isMinimized && (
        <>
          <ChatModeSelector 
            chatMode={chatMode} 
            onModeChange={setChatMode} 
          />

          <CardContent className="p-4">
            <ChatMessages messages={messages} />
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <ChatInput
              inputMessage={inputMessage}
              onInputChange={setInputMessage}
              onSend={handleSend}
              isLoading={isLoading}
            />
          </CardFooter>
        </>
      )}
    </Card>
  );
};