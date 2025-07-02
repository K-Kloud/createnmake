import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Image, CreditCard, HelpCircle, Settings } from "lucide-react";

type ChatMode = "customer" | "manufacturer";

interface QuickActionsProps {
  chatMode: ChatMode;
  onQuickAction: (question: string) => void;
  isAuthenticated: boolean;
}

export const QuickActions = ({ chatMode, onQuickAction, isAuthenticated }: QuickActionsProps) => {
  const customerActions = [
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: "How to generate images?",
      question: "How do I use the AI image generator to create custom designs?",
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      label: "Subscription plans",
      question: "What are the different subscription plans and their benefits?",
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Find manufacturers",
      question: "How can I find and connect with manufacturers for my designs?",
    },
    {
      icon: <Image className="h-4 w-4" />,
      label: "Image editing",
      question: "How do I edit and improve my generated images?",
    },
  ];

  const manufacturerActions = [
    {
      icon: <Users className="h-4 w-4" />,
      label: "Platform overview",
      question: "How does Create2Make work for manufacturers?",
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Setup portfolio",
      question: "How do I set up my manufacturer portfolio and showcase my work?",
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      label: "Manage quotes",
      question: "How do I manage quote requests and pricing for customers?",
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      label: "Best practices",
      question: "What are the best practices for manufacturers on the platform?",
    },
  ];

  const authActions = [
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Account help",
      question: "How do I manage my account settings and profile?",
    },
  ];

  const guestActions = [
    {
      icon: <Users className="h-4 w-4" />,
      label: "Getting started",
      question: "How do I get started with Create2Make? Do I need to sign up?",
    },
  ];

  const actions = chatMode === "manufacturer" ? manufacturerActions : customerActions;
  const extraActions = isAuthenticated ? authActions : guestActions;

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">
          {chatMode === "manufacturer" ? "Manufacturing Expert" : "Customer Support"}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground mb-3">
        Hi! I'm here to help you with Create2Make. Choose a quick question below or ask me anything:
      </div>

      <div className="grid grid-cols-1 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="justify-start h-auto p-2 text-left"
            onClick={() => onQuickAction(action.question)}
          >
            <div className="flex items-center gap-2">
              {action.icon}
              <span className="text-xs">{action.label}</span>
            </div>
          </Button>
        ))}
        
        {extraActions.map((action, index) => (
          <Button
            key={`extra-${index}`}
            variant="ghost"
            size="sm"
            className="justify-start h-auto p-2 text-left"
            onClick={() => onQuickAction(action.question)}
          >
            <div className="flex items-center gap-2">
              {action.icon}
              <span className="text-xs">{action.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};