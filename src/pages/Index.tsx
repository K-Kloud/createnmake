import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ImageGenerator } from "@/components/ImageGenerator";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Hero />
      <div className="container px-4 py-16 flex-grow">
        <ImageGenerator />
      </div>
      <Footer />
    </div>
  );
};

export default Index;