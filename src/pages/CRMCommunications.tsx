
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          
          <Card>
            <CardHeader>
              <CardTitle>Communication Center</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Communications module coming soon. This page will help you manage all your customer communications.
              </p>
            </CardContent>
          </Card>
        </div>
      </CRMLayout>
    </>
  );
};

export default CRMCommunications;
