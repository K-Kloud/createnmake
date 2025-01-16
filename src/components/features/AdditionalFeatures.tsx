import {
  Upload,
  Share2,
  Download,
  PaintBucket,
  Settings,
  Users,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import { AdditionalFeatureCard } from "./AdditionalFeatureCard";

const additionalFeatures = [
  {
    icon: Upload,
    title: "Reference Upload",
    description: "Upload inspiration images"
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share to social media"
  },
  {
    icon: Download,
    title: "Quick Downloads",
    description: "Multiple format options"
  },
  {
    icon: PaintBucket,
    title: "Color Control",
    description: "Precise color selection"
  },
  {
    icon: Settings,
    title: "Advanced Settings",
    description: "Fine-tune your results"
  },
  {
    icon: Users,
    title: "Artisan Network",
    description: "Connect with creators"
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy & sell designs"
  },
  {
    icon: MessageSquare,
    title: "Community",
    description: "Get feedback & tips"
  }
];

export const AdditionalFeatures = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-center gradient-text">Additional Features</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {additionalFeatures.map((feature, index) => (
          <AdditionalFeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};