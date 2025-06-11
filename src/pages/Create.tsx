
import { ImageGenerator } from "@/components/ImageGenerator";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { useEffect } from "react";

const Create = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AuthenticatedLayout
      title="Create Custom Design | AI-Powered Generation"
      description="Create custom designs with our AI-powered image generator. Generate unique clothing, furniture, and accessories with just a text prompt"
      className="container px-4 py-16 md:py-24 flex-grow"
    >
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Create New Design"
          subtitle="Generate custom designs for clothing, accessories, furniture, and more using AI. Simply describe what you want or upload a reference image for inspiration."
        />
        <ImageGenerator />
      </div>
    </AuthenticatedLayout>
  );
};

export default Create;
