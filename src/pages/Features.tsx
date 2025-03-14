import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MainFeatures } from "@/components/features/MainFeatures";
import { AdditionalFeatures } from "@/components/features/AdditionalFeatures";

const Features = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container px-4 py-12 flex-grow">
        <h1 className="text-4xl font-bold mb-4 gradient-text text-center">Platform Features</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Discover our comprehensive suite of features designed to help you create, customize, and bring your ideas to life.
        </p>
        <MainFeatures />
        <AdditionalFeatures />
      </main>
      <Footer />
    </div>
  );
};

export default Features;