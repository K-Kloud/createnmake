
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Helmet } from "react-helmet";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

const CRMAnalytics = () => {
  return (
    <>
      <Helmet>
        <title>Analytics | CRM</title>
      </Helmet>
      <CRMLayout currentTab="analytics">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          
          <AnalyticsDashboard />
        </div>
      </CRMLayout>
    </>
  );
};

export default CRMAnalytics;
