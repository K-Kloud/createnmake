import { Sparkles, Palette, Users, Truck, MessageSquare, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Sparkles,
    title: "AI Design Generation",
    description: "Create unique fashion designs instantly using advanced AI models tailored for clothing and accessories.",
    link: "/create"
  },
  {
    icon: Palette,
    title: "Style Customization",
    description: "Fine-tune colors, patterns, materials, and details to match your exact vision.",
    link: "/create"
  },
  {
    icon: Users,
    title: "Artisan Network",
    description: "Connect with 800+ verified craftspeople specializing in various techniques and materials.",
    link: "/marketplace"
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description: "Communicate directly with artisans to discuss requirements and get custom quotes.",
    link: "/messages"
  },
  {
    icon: Truck,
    title: "Production Tracking",
    description: "Monitor your orders from design approval through manufacturing to delivery.",
    link: "/manage"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your designs' performance, orders, and engagement with detailed insights.",
    link: "/dashboard"
  }
];

export const FeaturesGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/30">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-technical text-primary mb-2 block">CAPABILITIES</span>
          <h2 className="text-h2 mb-4">Everything You Need</h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            From AI-powered design to production and delivery — a complete platform for bringing fashion ideas to life.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              onClick={() => navigate(feature.link)}
              className="group p-6 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card cursor-pointer transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
