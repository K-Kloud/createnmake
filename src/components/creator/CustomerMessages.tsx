
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomerMessagesProps {
  creatorId: string;
}

interface Message {
  id: number;
  sender: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export const CustomerMessages = ({ creatorId }: CustomerMessagesProps) => {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [replyText, setReplyText] = useState("");
  
  // Sample data - would be fetched from the database in a real app
  const conversations = [
    {
      id: 1,
      customer: {
        id: "user1",
        name: "Emma Thompson",
        avatar: "",
      },
      lastMessage: "Hi, I'm interested in your modern chair design. Is it available for custom fabric options?",
      timestamp: new Date(2023, 4, 10, 14, 30),
      unreadCount: 1,
    },
    {
      id: 2,
      customer: {
        id: "user2",
        name: "James Wilson",
        avatar: "",
      },
      lastMessage: "Thanks for the information about shipping. I'd like to place an order.",
      timestamp: new Date(2023, 4, 9, 9, 15),
      unreadCount: 0,
    },
    {
      id: 3,
      customer: {
        id: "user3",
        name: "Sophia Davis",
        avatar: "",
      },
      lastMessage: "The table arrived yesterday. It looks fantastic! Thank you for the excellent craftsmanship.",
      timestamp: new Date(2023, 4, 8, 16, 45),
      unreadCount: 0,
    },
  ];
  
  const messages = [
    {
      id: 1,
      sender: {
        name: "Emma Thompson",
        avatar: "",
      },
      content: "Hi, I'm interested in your modern chair design. Is it available for custom fabric options?",
      timestamp: new Date(2023, 4, 10, 14, 30),
      isRead: false,
    },
    {
      id: 2,
      sender: {
        name: "You",
        avatar: "",
      },
      content: "Hello Emma! Yes, the chair is available with custom fabric options. We have several premium fabrics to choose from. Would you like me to send you a catalog?",
      timestamp: new Date(2023, 4, 10, 15, 45),
      isRead: true,
    },
  ];
  
  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    // In a real app, this would send the message to the database
    toast({
      title: "Message Sent",
      description: "Your reply has been sent successfully.",
    });
    setReplyText("");
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      <Card className="md:col-span-1 overflow-hidden">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>Manage customer inquiries</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto" style={{ maxHeight: "500px" }}>
          <div className="divide-y">
            {conversations.map(conversation => (
              <div 
                key={conversation.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedConversation === conversation.id ? 'bg-muted' : ''}`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={conversation.customer.avatar} />
                    <AvatarFallback>{conversation.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{conversation.customer.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {conversation.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>
            {selectedConversation ? 
              conversations.find(c => c.id === selectedConversation)?.customer.name : 
              "Select a conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto" style={{ maxHeight: "400px" }}>
          {selectedConversation ? (
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender.name === "You" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender.name === "You" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to view messages</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-4">
          {selectedConversation && (
            <div className="grid w-full gap-2">
              <Textarea
                placeholder="Type your message..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px]"
              />
              <Button onClick={handleSendReply}>Send Message</Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
