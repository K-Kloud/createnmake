
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CRMCalendar = () => {
  return (
    <>
      <Helmet>
        <title>Calendar | CRM</title>
      </Helmet>
      <CRMLayout currentTab="calendar">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Calendar</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Calendar module coming soon. This page will display your scheduled tasks and appointments.
              </p>
            </CardContent>
          </Card>
        </div>
      </CRMLayout>
    </>
  );
};

export default CRMCalendar;
