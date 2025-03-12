import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAccess } from "@/components/settings/AdminAccess";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container px-4 py-8 pt-24 md:pt-32">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <h2 className="text-2xl font-bold">Account Settings</h2>
                <p>Manage your account settings and preferences.</p>
                {/* Account settings form would go here */}
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <h2 className="text-2xl font-bold">Appearance</h2>
                <p>Customize how the application looks and feels.</p>
                {/* Appearance settings would go here */}
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p>Configure your notification preferences.</p>
                {/* Notification settings would go here */}
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <h2 className="text-2xl font-bold">Billing</h2>
                <p>Manage your subscription and billing information.</p>
                {/* Billing information would go here */}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            {/* Only show admin access if user is logged in */}
            {session && <AdminAccess />}
            
            {/* Additional sidebar components can go here */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
