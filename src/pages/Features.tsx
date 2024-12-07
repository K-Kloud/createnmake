import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Zap, Shield, Sparkles } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Wand2 className="h-8 w-8" />,
      title: "Advanced AI Generation",
      description: "Create stunning images with our state-of-the-art AI technology.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Generate images in seconds with our optimized infrastructure.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your data and creations are protected with enterprise-grade security.",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Style Variety",
      description: "Choose from multiple artistic styles to match your vision.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Features</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="text-primary">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Features;