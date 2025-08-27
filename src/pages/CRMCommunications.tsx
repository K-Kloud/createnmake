
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const CRMCommunications = () => {
  return (
    <>
      <Helmet>
        <title>Communications | CRM</title>
      </Helmet>
      <CRMLayout currentTab="communications">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Communications</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No conversations yet</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Communication Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Messaging System Active</h3>
                <p className="text-muted-foreground mb-6">
                  The complete messaging system is now available. Monitor and manage all platform communications.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link to="/messages">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Messages
                    </Link>
                  </Button>
                  <Button variant="outline">
                    View Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CRMLayout>
    </>
  );
};

export default CRMCommunications;
