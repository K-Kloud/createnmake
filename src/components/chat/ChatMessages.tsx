import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return (
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
  );
};