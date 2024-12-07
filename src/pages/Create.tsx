import { ImageGenerator } from "@/components/ImageGenerator";
import { Header } from "@/components/Header";

const Create = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-24">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Create New Image</h1>
        <ImageGenerator />
      </div>
    </div>
  );
};

export default Create;