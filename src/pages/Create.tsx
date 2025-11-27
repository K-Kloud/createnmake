
import { ImageGenerator } from "@/components/ImageGenerator";
import { MainLayout } from "@/components/layouts/MainLayout";
import { TemplateGallery } from "@/components/templates/TemplateGallery";
import { CreditEarning } from "@/components/credits/CreditEarning";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

const Create = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<{ prompt: string; itemType: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelectTemplate = (prompt: string, itemType: string) => {
    setSelectedTemplate({ prompt, itemType });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout
      seo={{
        title: "Create Custom Design | AI-Powered Generation",
        description: "Create custom designs with our AI-powered image generator. Generate unique clothing, furniture, and accessories with just a text prompt."
      }}
    >
      <div className="container px-4 py-16 md:py-24 flex-grow">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-primary hover:brightness-125 transition-all duration-300 rounded-lg">
              Create New Design
            </h1>
            <p className="text-muted-foreground mb-8">
              Generate custom designs for clothing, accessories, furniture, and more using AI. 
              Simply describe what you want or upload a reference image for inspiration.
            </p>
          </div>

          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="credits">Earn Credits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generator" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <ImageGenerator initialTemplate={selectedTemplate} />
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="mt-8">
              <TemplateGallery onSelectTemplate={handleSelectTemplate} />
            </TabsContent>
            
            <TabsContent value="credits" className="mt-8">
              <div className="max-w-2xl mx-auto">
                <CreditEarning />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Create;
