import { MainLayout } from "@/components/layouts/MainLayout";
import { AdvancedAnalyticsDashboard } from "@/components/analytics/AdvancedAnalyticsDashboard";

const AdvancedAnalytics = () => {
  return (
    <MainLayout
      seo={{
        title: "Advanced Analytics | AI-Powered Insights",
        description: "AI-powered analytics with predictive insights, anomaly detection, and advanced reporting capabilities."
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <AdvancedAnalyticsDashboard />
      </div>
    </MainLayout>
  );
};

export default AdvancedAnalytics;