
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CRMAnalytics = () => {
  return (
    <>
      <Helmet>
        <title>Analytics | CRM</title>
      </Helmet>
      <CRMLayout currentTab="analytics">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Analytics module coming soon. This page will display comprehensive business analytics and insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </CRMLayout>
    </>
  );
};

export default CRMAnalytics;
