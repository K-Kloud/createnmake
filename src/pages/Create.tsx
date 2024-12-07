import { ImageGenerator } from "@/components/ImageGenerator";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Create = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Create New Image</h1>
        <ImageGenerator />
      </div>
      <Footer />
    </div>
  );
};

export default Create;