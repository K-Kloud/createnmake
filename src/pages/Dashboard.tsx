
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationCenter } from "@/components/NotificationCenter";

const Dashboard = () => {
  const { isAuthenticated } = useAuthGuard();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  
  // Get dashboard data using our custom hook
  const { 
    profile, 
    generatedImagesCount,
    likesCount, 
    ordersCount, 
    productsCount 
  } = useDashboardData(session, user);

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <ErrorBoundary>
        <div className="container px-4 py-24 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Profile Card */}
                <ProfileCard 
                  profile={profile} 
                  userEmail={session?.user.email} 
                  userId={session?.user.id}
                />

                {/* Stats Overview */}
                <DashboardStats />

                {/* Quick Actions */}
                <QuickActions />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <DashboardTabs 
                userId={session?.user.id}
                userEmail={session?.user.email}
                profile={profile}
              />
            </div>
          </div>
        </div>
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

export default Dashboard;
