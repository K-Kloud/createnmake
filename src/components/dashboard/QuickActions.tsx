
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button 
            variant="default" 
            className="w-full justify-between"
            onClick={() => navigate("/create")}
          >
            Create New Design
            <MoveUpRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => navigate("/marketplace")}
          >
            Browse Marketplace
            <MoveUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
