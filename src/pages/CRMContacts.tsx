
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const CRMContacts = () => {
  return (
    <>
      <Helmet>
        <title>Contacts | CRM</title>
      </Helmet>
      <CRMLayout currentTab="contacts">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Contacts</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Contact management module coming soon. This page will allow you to manage all your contacts and customers.
              </p>
            </CardContent>
          </Card>
        </div>
      </CRMLayout>
    </>
  );
};

export default CRMContacts;
