
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminAccess } from "@/components/settings/AdminAccess";
import { MFASettings } from "@/components/settings/MFASettings";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  // Check if user is logged in
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/');
    }
  }, [isLoading, session, navigate]);

  if (isLoading || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-6">
                <Card className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4">Account Information</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium block mb-1">Email</label>
                        <input
                          type="email"
                          value={session.user.email || ""}
                          readOnly
                          className="w-full p-2 rounded-md border bg-background/50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          To change your email, please contact support
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Username</label>
                        <input
                          type="text"
                          value={profile?.username || ""}
                          className="w-full p-2 rounded-md border bg-background/50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4">Profile</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium block mb-1">First Name</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-md border"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Last Name</label>
                        <input
                          type="text"
                          className="w-full p-2 rounded-md border"
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium block mb-1">Bio</label>
                        <textarea
                          className="w-full p-2 rounded-md border resize-none h-24"
                          placeholder="Tell us about yourself"
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                      >
                        Update Profile
                      </button>
                    </div>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <MFASettings />
                
                <Card className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4">Change Password</h2>
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">Current Password</label>
                        <input
                          type="password"
                          className="w-full p-2 rounded-md border"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">New Password</label>
                        <input
                          type="password"
                          className="w-full p-2 rounded-md border"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full p-2 rounded-md border"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="email_orders" className="mt-1" />
                      <div>
                        <label htmlFor="email_orders" className="font-medium block">Order Updates</label>
                        <p className="text-sm text-muted-foreground">Receive email notifications about your orders</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="email_marketing" className="mt-1" />
                      <div>
                        <label htmlFor="email_marketing" className="font-medium block">Marketing</label>
                        <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="browser_notifications" className="mt-1" />
                      <div>
                        <label htmlFor="browser_notifications" className="font-medium block">Browser Notifications</label>
                        <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="admin">
                <AdminAccess />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
