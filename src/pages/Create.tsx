import { ImageGenerator } from "@/components/ImageGenerator";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Sparkles, LayoutGrid, Coins } from "lucide-react";

const TemplateGallery = lazy(() =>
  import("@/components/templates/TemplateGallery").then((m) => ({
    default: m.TemplateGallery,
  }))
);
const CreditEarning = lazy(() =>
  import("@/components/credits/CreditEarning").then((m) => ({
    default: m.CreditEarning,
  }))
);

const SectionFallback = () => (
  <div className="flex justify-center py-16">
    <LoadingSpinner size="lg" />
  </div>
);

const Create = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<{
    prompt: string;
    itemType: string;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelectTemplate = (prompt: string, itemType: string) => {
    setSelectedTemplate({ prompt, itemType });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout
      seo={{
        title: "Create Custom Design | AI-Powered Generation",
        description:
          "Create custom designs with our AI-powered image generator. Generate unique clothing, furniture, and accessories with just a text prompt.",
      }}
    >
      <div className="container px-4 py-12 md:py-20 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 pb-8 border-b border-border/40">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full hud-pulse" />
            <span className="text-label">DESIGN STUDIO</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h1 className="text-h1">Create New Design</h1>
            <p className="text-body text-muted-foreground max-w-md">
              Describe what you want or upload a reference image. The AI handles
              the rest.
            </p>
          </div>
        </header>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3 bg-card/50 p-1 border border-border/40">
            <TabsTrigger
              value="generator"
              className="font-mono text-xs uppercase tracking-wider gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generator
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="font-mono text-xs uppercase tracking-wider gap-2"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="font-mono text-xs uppercase tracking-wider gap-2"
            >
              <Coins className="w-3.5 h-3.5" />
              Credits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-10">
            <div className="max-w-4xl mx-auto">
              <ImageGenerator initialTemplate={selectedTemplate} />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-10">
            <Suspense fallback={<SectionFallback />}>
              <TemplateGallery onSelectTemplate={handleSelectTemplate} />
            </Suspense>
          </TabsContent>

          <TabsContent value="credits" className="mt-10">
            <div className="max-w-2xl mx-auto">
              <Suspense fallback={<SectionFallback />}>
                <CreditEarning />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Create;
