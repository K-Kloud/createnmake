
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Zap } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";

export default function Subscription() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const {
    plans,
    plansLoading,
    subscriptionStatus,
    statusLoading,
    subscribe,
    manageSubscription,
    isSubscribing,
    isManaging,
  } = useSubscription();

  // If user is not logged in, show auth dialog
  React.useEffect(() => {
    if (!session && !statusLoading) {
      setAuthDialogOpen(true);
    }
  }, [session, statusLoading]);

  // Handle subscribe button click
  const handleSubscribe = (planId: number) => {
    if (!session) {
      setAuthDialogOpen(true);
      return;
    }
    subscribe(planId);
  };

  // Determine current tier
  const currentTier = subscriptionStatus?.tier || "free";

  return (
    <main className="container max-w-7xl px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 gradient-text">Creator Subscription Plans</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that works best for you and unlock more AI-generated designs to bring your creative vision to life.
        </p>
      </div>

      {/* Current subscription info */}
      {session && subscriptionStatus && subscriptionStatus.tier !== "free" && (
        <Card className="max-w-2xl mx-auto mb-12 border-primary/50">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Your Current Subscription</span>
              <Badge className="bg-primary">{subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)}</Badge>
            </CardTitle>
            <CardDescription>
              You have generated {subscriptionStatus.images_generated} of {subscriptionStatus.monthly_image_limit} images this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionStatus.current_period_end && (
              <p className="text-sm text-muted-foreground">
                Your subscription will {subscriptionStatus.cancel_at_period_end ? 'end' : 'renew'} on {new Date(subscriptionStatus.current_period_end).toLocaleDateString()}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => manageSubscription()} 
              disabled={isManaging}
              className="w-full"
            >
              {isManaging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Manage Subscription"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Plans grid */}
      {plansLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => {
            const isCurrentPlan = plan.name.toLowerCase() === currentTier;
            const features = typeof plan.features === 'string' 
              ? JSON.parse(plan.features) 
              : plan.features || [];
              
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden ${
                  isCurrentPlan ? 'border-primary shadow-lg' : ''
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs">
                    Current Plan
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">£{plan.price}</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => manageSubscription()} 
                      disabled={isManaging}
                    >
                      Manage Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe(plan.id)} 
                      disabled={isSubscribing || plan.name.toLowerCase() === 'free'}
                      variant={plan.price > 0 ? "default" : "outline"}
                    >
                      {isSubscribing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : plan.price > 0 ? (
                        "Subscribe"
                      ) : (
                        "Current Free Plan"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <AuthDialog 
        isOpen={authDialogOpen} 
        onClose={() => {
          setAuthDialogOpen(false);
          if (!session) {
            navigate("/");
          }
        }} 
      />
    </main>
  );
}
