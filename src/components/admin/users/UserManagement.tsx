import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtisanOnboardingForm } from "@/components/artisan/ArtisanOnboardingForm";
import { ManufacturerOnboardingForm } from "@/components/manufacturer/ManufacturerOnboardingForm";

export const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("artisan");

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="artisan">Add Artisan</TabsTrigger>
            <TabsTrigger value="manufacturer">Add Manufacturer</TabsTrigger>
          </TabsList>

          <TabsContent value="artisan" className="space-y-4">
            <ArtisanOnboardingForm />
          </TabsContent>

          <TabsContent value="manufacturer" className="space-y-4">
            <ManufacturerOnboardingForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};