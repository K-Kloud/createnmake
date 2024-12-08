import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  MessageCircle,
  MinimizeIcon,
  X,
  Send,
  Factory,
  HeadphonesIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

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

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        text: `This is a simulated response from ${
          chatMode === "customer" ? "customer care" : "manufacturer"
        }. Real responses would be integrated here.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);

    setInputMessage("");
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="text-sm font-medium">Chat Support</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <MinimizeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Button
                variant={chatMode === "customer" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setChatMode("customer")}
              >
                <HeadphonesIcon className="mr-2 h-4 w-4" />
                Customer Care
              </Button>
              <Button
                variant={chatMode === "manufacturer" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setChatMode("manufacturer")}
              >
                <Factory className="mr-2 h-4 w-4" />
                Manufacturer
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            <ScrollArea className="h-[300px] pr-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
              />
              <Button size="icon" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};