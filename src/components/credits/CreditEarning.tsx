import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Share2, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const CreditEarning = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const claimWelcomeBonus = async () => {
    if (!session?.user) {
      toast({
        variant: "destructive",
        title: "Please sign in",
        description: "You need to be signed in to claim bonuses",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Simulate bonus claim
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Welcome Bonus Claimed! 🎉",
        description: "5 bonus generations added to your account",
      });
    } catch (error) {
      console.error('Error claiming bonus:', error);
      toast({
        variant: "destructive",
        title: "Failed to claim bonus",
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const earnWithActions = [
    {
      icon: Share2,
      title: "Share Your Design",
      description: "Share your creation on social media",
      credits: 2,
      action: "share"
    },
    {
      icon: Users,
      title: "Invite Friends",
      description: "Each friend who signs up earns you credits",
      credits: 3,
      action: "invite"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="size-6 text-primary" />
            <CardTitle>Welcome Bonus</CardTitle>
          </div>
          <CardDescription>
            Claim your free 5 bonus generations as a new user!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={claimWelcomeBonus} 
            disabled={loading || !session}
            className="w-full gap-2"
          >
            <Sparkles className="size-4" />
            {session ? "Claim 5 Free Generations" : "Sign in to Claim"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earn More Generations</CardTitle>
          <CardDescription>
            Complete actions to earn additional generation credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {earnWithActions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">+{item.credits}</p>
                  <p className="text-xs text-muted-foreground">generations</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
