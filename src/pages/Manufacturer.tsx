
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { ManufacturerCategoriesGrid } from "@/components/manufacturer/ManufacturerCategoriesGrid";
import { ManufacturerList } from "@/components/manufacturer/ManufacturerList";
import { ManufacturerDashboard } from "@/components/manufacturer/ManufacturerDashboard";
import { LoadingState } from "@/components/ui/loading-state";

const Manufacturer = () => {
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  return (
    <PageLayout 
      title="Manufacturing | Create2Make"
      description="Connect with manufacturers to bring your designs to life"
    >
      <LoadingState isLoading={isLoading}>
        {session?.user ? (
          <ManufacturerDashboard manufacturerId={session.user.id} />
        ) : (
          <main className="w-full px-4 sm:px-6 py-12 sm:py-16 md:py-24 max-w-7xl mx-auto">
            <PageHeader title="Manufacturing Categories" />
            <ManufacturerCategoriesGrid />
            <ManufacturerList />
          </main>
        )}
      </LoadingState>
    </PageLayout>
  );
};

export default Manufacturer;
