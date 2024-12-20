import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ManufacturerCard } from "@/components/manufacturer/ManufacturerCard";
import { CategoryCard } from "@/components/manufacturer/CategoryCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Scissors, 
  Footprints, 
  Printer, 
  Gem, 
  Briefcase, 
  Armchair,
  Bell,
  type LucideIcon 
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Scissors,
  Footprints,
  Printer,
  Gem,
  Briefcase,
  Armchair,
};

const categoryImages = {
  "Tailor": "https://images.unsplash.com/photo-1452960962994-acf4fd70b632",
  "Cobbler": "https://images.unsplash.com/photo-1449247709967-d4461a6a6103",
  "Printer": "https://images.unsplash.com/photo-1485833077593-4278bba3f11f",
  "Goldsmith": "https://images.unsplash.com/photo-1441057206919-63d19fac2369",
  "Leather Worker": "https://images.unsplash.com/photo-1469041797191-50ace28483c3",
  "Furniture Maker": "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2",
};

const Manufacturer = () => {
  const { toast } = useToast();

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {manufacturerCategories.map((category) => {
            const IconComponent = iconMap[category.icon];
            return (
              <CategoryCard
                key={category.id}
                name={category.name}
                description={category.description}
                icon={IconComponent}
                image={categoryImages[category.name] || ""}
                count={getCategoryCount(category.name)}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setDialogOpen(true);
                }}
              />
            );
          })}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCategory} Manufacturers</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-6 mt-4">
              {filteredManufacturers.map((manufacturer) => (
                <ManufacturerCard
                  key={manufacturer.id}
                  {...manufacturer}
                />
              ))}
              {filteredManufacturers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No manufacturers found for this category.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <h2 className="text-2xl font-semibold mb-6">All Manufacturers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {manufacturers.map((manufacturer) => (
            <ManufacturerCard
              key={manufacturer.id}
              {...manufacturer}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Manufacturer;
