import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ImageGenerator } from "@/components/ImageGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <div className="container px-4 py-16">
        <ImageGenerator />
      </div>
    </div>
  );
};

export default Index;