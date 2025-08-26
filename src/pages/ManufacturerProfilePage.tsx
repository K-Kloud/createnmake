// Layout will be handled by parent component - removing imports
import { ManufacturerProfile } from "@/components/manufacturer/ManufacturerProfile";
import { ManufacturerPortfolio } from "@/components/manufacturer/ManufacturerPortfolio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const ManufacturerProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <main className="container px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold gradient-text mb-8">
          Manage Profile & Portfolio
        </h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <ManufacturerProfile manufacturerId={user.id} />
          </TabsContent>
          
          <TabsContent value="portfolio" className="space-y-6">
            <ManufacturerPortfolio manufacturerId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default ManufacturerProfilePage;