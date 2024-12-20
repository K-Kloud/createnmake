import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ManufacturerCategoriesGrid } from "@/components/manufacturer/ManufacturerCategoriesGrid";
import { ManufacturerList } from "@/components/manufacturer/ManufacturerList";
import { ManufacturerDashboard } from "@/components/manufacturer/ManufacturerDashboard";

const Manufacturer = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {session?.user ? (
        <ManufacturerDashboard manufacturerId={session.user.id} />
      ) : (
        <main className="container px-4 py-24">
          <h1 className="text-4xl font-bold mb-8 gradient-text">
            Manufacturing Categories
          </h1>
          <ManufacturerCategoriesGrid />
          <ManufacturerList />
        </main>
      )}
      <Footer />
    </div>
  );
};

export default Manufacturer;