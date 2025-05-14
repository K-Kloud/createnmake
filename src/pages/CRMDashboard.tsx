
import { CRMLayout } from "@/components/crm/CRMLayout";
import { CRMDashboard as Dashboard } from "@/components/crm/dashboard/CRMDashboard";
import { Helmet } from "react-helmet";

const CRMDashboard = () => {
  return (
    <>
      <Helmet>
        <title>CRM Dashboard | Your App</title>
      </Helmet>
      <CRMLayout currentTab="dashboard">
        <Dashboard />
      </CRMLayout>
    </>
  );
};

export default CRMDashboard;
