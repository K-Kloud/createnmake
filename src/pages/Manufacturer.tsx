import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ManufacturerCategoriesGrid } from "@/components/manufacturer/ManufacturerCategoriesGrid";
import { ManufacturerList } from "@/components/manufacturer/ManufacturerList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // Import the useToast hook

const Manufacturer = () => {
  const { toast } = useToast(); // Add this line to use toast

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: manufacturerProfile } = useQuery({
    queryKey: ['manufacturer', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('manufacturer_notifications')
        .select('*')
        .eq('manufacturer_id', session.user.id)
        .order('created_at', { ascending: false });
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: quoteRequests } = useQuery({
    queryKey: ['quotes', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('quote_requests')
        .select('*, profiles(username)')
        .eq('manufacturer_id', session.user.id)
        .order('created_at', { ascending: false });
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (manufacturerProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-24">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold gradient-text">
              Manufacturer Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {notifications?.filter(n => !n.is_read).length || 0}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-semibold mb-4">{manufacturerProfile.business_name}</h2>
                <div className="grid gap-4">
                  <p><strong>Type:</strong> {manufacturerProfile.business_type}</p>
                  <p><strong>Email:</strong> {manufacturerProfile.contact_email}</p>
                  <p><strong>Phone:</strong> {manufacturerProfile.phone}</p>
                  <p><strong>Address:</strong> {manufacturerProfile.address}</p>
                  <div>
                    <strong>Specialties:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {manufacturerProfile.specialties?.map((specialty: string) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 text-sm rounded-full bg-primary/10 text-primary"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quotes" className="space-y-4">
              {quoteRequests?.map((quote: any) => (
                <div key={quote.id} className="glass-card p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        Request from {quote.profiles?.username || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      quote.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      quote.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                  <p className="mt-4">{quote.product_details}</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Handle quote response
                        toast({
                          title: "Quote response sent",
                          description: "The customer will be notified of your response.",
                        });
                      }}
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              {notifications?.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`glass-card p-6 ${!notification.is_read ? 'border-primary' : ''}`}
                >
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-2">{notification.message}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-24">
        <h1 className="text-4xl font-bold mb-8 gradient-text">
          Manufacturing Categories
        </h1>
        
        <ManufacturerCategoriesGrid />
        <ManufacturerList />
      </main>
      <Footer />
    </div>
  );
};

export default Manufacturer;