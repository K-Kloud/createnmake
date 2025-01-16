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
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Features = () => {
  const mainFeatures = [
    {
      icon: <Wand2 className="h-12 w-12 text-primary animate-bounce-slow" />,
      title: "Advanced AI Generation",
      description: "Create stunning, custom-made images with our state-of-the-art AI technology.",
      steps: [
        "Navigate to the Create page",
        "Choose from various item categories",
        "Enter detailed descriptions",
        "Select your preferred aspect ratio",
        "Upload reference images (optional)",
        "Click Generate to create your design"
      ]
    },
    {
      icon: <Zap className="h-12 w-12 text-primary animate-pulse" />,
      title: "Lightning Fast Processing",
      description: "Experience rapid image generation with our optimized infrastructure.",
      steps: [
        "Average generation time: 10-30 seconds",
        "Real-time preview of progress",
        "Batch processing capabilities",
        "Instant image optimization",
        "Quick download and sharing"
      ]
    },
    {
      icon: <Shield className="h-12 w-12 text-primary animate-bounce-slow" />,
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
      icon: <Sparkles className="h-12 w-12 text-primary animate-pulse" />,
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
      icon: <Upload className="h-8 w-8" />,
      title: "Reference Upload",
      description: "Upload inspiration images"
    },
    {
      icon: <Share2 className="h-8 w-8" />,
      title: "Easy Sharing",
      description: "Share to social media"
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: "Quick Downloads",
      description: "Multiple format options"
    },
    {
      icon: <PaintBucket className="h-8 w-8" />,
      title: "Color Control",
      description: "Precise color selection"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Advanced Settings",
      description: "Fine-tune your results"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Artisan Network",
      description: "Connect with creators"
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Marketplace",
      description: "Buy & sell designs"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Community",
      description: "Get feedback & tips"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container px-4 py-12 flex-grow">
        <h1 className="text-4xl font-bold mb-4 gradient-text text-center">Platform Features</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Discover our comprehensive suite of features designed to help you create, customize, and bring your ideas to life.
        </p>

        {/* Main Features Infographic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="glass-card hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 gradient-text">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h4 className="font-medium text-center mb-4">How to use:</h4>
                  <div className="space-y-3">
                    {feature.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <h2 className="text-2xl font-bold mb-8 text-center gradient-text">Additional Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {additionalFeatures.map((feature, index) => (
            <Card key={index} className="glass-card hover:shadow-lg transition-shadow group">
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-primary transform group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
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