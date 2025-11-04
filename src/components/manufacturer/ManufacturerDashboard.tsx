import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bell, Package, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { ManufacturerOverview } from "./ManufacturerOverview";
import { ManufacturerQuotes } from "./ManufacturerQuotes";
import { ManufacturerNotifications } from "./ManufacturerNotifications";
import { MakerPayoutsPanel } from "@/components/maker/MakerPayoutsPanel";

interface ManufacturerDashboardProps {
  manufacturerId: string;
}

export const ManufacturerDashboard = ({ manufacturerId }: ManufacturerDashboardProps) => {
  const { toast } = useToast();

  const { data: manufacturerProfile } = useQuery({
    queryKey: ['manufacturer', manufacturerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('id', manufacturerId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching manufacturer:', error);
        return null;
      }
      return data;
    },
    enabled: !!manufacturerId,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', manufacturerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturer_notifications')
        .select('*')
        .eq('manufacturer_id', manufacturerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return null;
      }
      return data;
    },
    enabled: !!manufacturerId,
  });

  return (
    <main className="container px-4 py-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">
          Manufacturer Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/manufacturer/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Manage Profile
            </Button>
          </Link>
          <Link to="/manufacturer/orders">
            <Button variant="outline" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manage Orders
            </Button>
          </Link>
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
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ManufacturerOverview manufacturer={manufacturerProfile} />
        </TabsContent>

        <TabsContent value="quotes">
          <ManufacturerQuotes manufacturerId={manufacturerId} toast={toast} />
        </TabsContent>

        <TabsContent value="payouts">
          <MakerPayoutsPanel />
        </TabsContent>

        <TabsContent value="notifications">
          <ManufacturerNotifications notifications={notifications} />
        </TabsContent>
      </Tabs>
    </main>
  );
};