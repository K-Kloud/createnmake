import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArtisanProfile } from "@/components/artisan/ArtisanProfile";

const ArtisanProfilePage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ArtisanProfile />
      </main>
      <Footer />
    </div>
  );
};

export default ArtisanProfilePage;