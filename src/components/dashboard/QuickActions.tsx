
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoveUpRight, PlusCircle, Store, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions = () => {
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
            asChild
          >
            <Link to="/create">
              <span className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Design
              </span>
              <MoveUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            asChild
          >
            <Link to="/marketplace">
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Browse Marketplace
              </span>
              <MoveUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-between"
            asChild
          >
            <Link to="/designs">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View All Designs
              </span>
              <MoveUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
