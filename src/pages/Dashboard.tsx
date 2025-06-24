
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Image, ShoppingBag, Settings, BarChart, Users } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";
import { RecentDesigns } from "@/components/dashboard/RecentDesigns";
import { DesignsPanel } from "@/components/dashboard/DesignsPanel";
import { StatsOverview } from "@/components/dashboard/StatsOverview";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <StandardPageLayout
        title="Dashboard"
        seo={{
          title: "Dashboard | Create2Make",
          description: "Access your personal dashboard to manage designs, orders, and account settings.",
        }}
      >
        <Card className="p-8 text-center">
          <p className="mb-4">Please sign in to access your dashboard.</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </StandardPageLayout>
    );
  }

  const quickActions = [
    {
      title: "Create New Design",
      description: "Generate a new AI design",
      icon: Plus,
      href: "/create",
      color: "bg-primary/10 text-primary"
    },
    {
      title: "My Designs",
      description: "View and manage your designs",
      icon: Image,
      href: "/designs",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Orders",
      description: "Track your orders",
      icon: ShoppingBag,
      href: "/orders",
      color: "bg-green-500/10 text-green-600"
    },
    {
      title: "Settings",
      description: "Account preferences",
      icon: Settings,
      href: "/settings",
      color: "bg-purple-500/10 text-purple-600"
    }
  ];

  return (
    <StandardPageLayout
      title="Dashboard"
      description="Welcome back! Here's an overview of your account."
      showBreadcrumbs={false}
      seo={{
        title: "Dashboard | Create2Make",
        description: "Access your personal dashboard to manage designs, orders, and account settings.",
      }}
    >
      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.href} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={action.href}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className={`rounded-lg p-2 ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Designs */}
          <div>
            <RecentDesigns />
          </div>

          {/* Designs Panel */}
          <div>
            <DesignsPanel />
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default Dashboard;
