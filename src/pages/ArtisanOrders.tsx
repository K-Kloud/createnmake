import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArtisanOrderDashboard } from "@/components/artisan/ArtisanOrderDashboard";

const ArtisanOrders = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ArtisanOrderDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default ArtisanOrders;