
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetchStatus, statusLoading } = useSubscription();
  
  // Get the session_id from the URL
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");
  
  // Refetch subscription status when the component mounts
  useEffect(() => {
    if (sessionId) {
      refetchStatus();
    }
  }, [sessionId, refetchStatus]);
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Subscription Successful!</CardTitle>
          <CardDescription className="text-center">
            Thank you for subscribing. Your subscription has been activated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              You can now create amazing designs with your subscription benefits.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate("/subscription")}>
            View Subscription
          </Button>
          <Button onClick={() => navigate("/")}>
            Create Designs
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
