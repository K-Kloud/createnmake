import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtisanOnboardingForm } from "@/components/artisan/ArtisanOnboardingForm";

const ArtisanOnboarding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-24">
        <Card className="max-w-2xl mx-auto glass-card">
          <CardHeader>
            <CardTitle>Complete Your Artisan Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ArtisanOnboardingForm />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ArtisanOnboarding;