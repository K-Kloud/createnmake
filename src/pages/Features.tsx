import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wand2, 
  Zap, 
  Shield, 
  Sparkles, 
  Upload, 
  Share2, 
  Download,
  PaintBucket,
  Settings,
  Users,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Features = () => {
  const mainFeatures = [
    {
      icon: <Wand2 className="h-8 w-8" />,
      title: "Advanced AI Generation",
      description: "Create stunning, custom-made images with our state-of-the-art AI technology.",
      steps: [
        "Navigate to the Create page",
        "Choose from various item categories (clothing, furniture, accessories)",
        "Enter detailed descriptions of what you want to generate",
        "Select your preferred aspect ratio",
        "Upload reference images for inspiration (optional)",
        "Click Generate to create your unique design"
      ]
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast Processing",
      description: "Experience rapid image generation with our optimized infrastructure.",
      steps: [
        "Average generation time: 10-30 seconds",
        "Real-time preview of generation progress",
        "Batch processing capabilities",
        "Instant image optimization",
        "Quick download and sharing options"
      ]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your data and creations are protected with enterprise-grade security.",
      steps: [
        "Secure user authentication",
        "End-to-end encryption",
        "Private image storage",
        "Customizable privacy settings",
        "Regular security audits",
        "GDPR compliance"
      ]
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Style Variety",
      description: "Choose from multiple artistic styles to match your vision.",
      steps: [
        "Multiple design aesthetics",
        "Customizable style parameters",
        "Style mixing capabilities",
        "Reference-based styling",
        "Trending style suggestions"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Reference Image Upload",
      description: "Upload inspiration images to guide the AI generation process"
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Easy Sharing",
      description: "Share your creations directly to social media or via link"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Quick Downloads",
      description: "Download your generated images in various formats and sizes"
    },
    {
      icon: <PaintBucket className="h-6 w-6" />,
      title: "Color Customization",
      description: "Specify exact colors and patterns for your generations"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Advanced Settings",
      description: "Fine-tune generation parameters for perfect results"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Artisan Network",
      description: "Connect with skilled artisans to bring your designs to life"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Marketplace",
      description: "Browse and purchase unique, AI-generated designs"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Community Feedback",
      description: "Get feedback and suggestions from the community"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container px-4 py-12 flex-grow">
        <h1 className="text-4xl font-bold mb-4 gradient-text text-center">Platform Features</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Discover our comprehensive suite of features designed to help you create, customize, and bring your ideas to life with AI-powered technology.
        </p>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-primary">{feature.icon}</div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h4 className="font-medium mb-2">How to use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {feature.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <h2 className="text-2xl font-bold mb-8 text-center">Additional Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {additionalFeatures.map((feature, index) => (
            <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-primary">{feature.icon}</div>
                  <h3 className="font-medium">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;