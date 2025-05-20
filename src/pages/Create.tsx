
import { ImageGenerator } from "@/components/ImageGenerator";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useEffect } from "react";

const Create = () => {
  // Add scroll to top effect when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout
      seo={{
        title: "Create Custom Design | AI-Powered Generation",
        description: "Create custom designs with our AI-powered image generator. Generate unique clothing, furniture, and accessories with just a text prompt."
      }}
    >
      <div className="container px-4 py-16 md:py-24 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-primary hover:brightness-125 transition-all duration-300 rounded-lg">
            Create New Design
          </h1>
          <p className="text-muted-foreground mb-8">
            Generate custom designs for clothing, accessories, furniture, and more using AI. 
            Simply describe what you want or upload a reference image for inspiration.
          </p>
          <ImageGenerator />
        </div>
      </div>
    </MainLayout>
  );
};

export default Create;
