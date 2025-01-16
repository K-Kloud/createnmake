import { Wand2, Zap, Shield, Sparkles } from "lucide-react";
import { MainFeatureCard } from "./MainFeatureCard";

const mainFeatures = [
  {
    icon: Wand2,
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
    icon: Zap,
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
    icon: Shield,
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
    icon: Sparkles,
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

export const MainFeatures = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {mainFeatures.map((feature, index) => (
        <MainFeatureCard key={index} {...feature} />
      ))}
    </div>
  );
};