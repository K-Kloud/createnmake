import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const features = [
  {
    id: "01",
    title: "AI Generation",
    description: "Create unique fashion designs instantly using advanced AI models.",
    link: "/create"
  },
  {
    id: "02",
    title: "Customization",
    description: "Fine-tune colors, patterns, materials to match your vision.",
    link: "/create"
  },
  {
    id: "03",
    title: "Artisan Network",
    description: "Connect with 800+ verified craftspeople across specializations.",
    link: "/marketplace"
  },
  {
    id: "04",
    title: "Direct Messaging",
    description: "Communicate directly with artisans for quotes and requirements.",
    link: "/messages"
  },
  {
    id: "05",
    title: "Production Tracking",
    description: "Monitor orders from approval through manufacturing to delivery.",
    link: "/manage"
  },
  {
    id: "06",
    title: "Analytics",
    description: "Track performance, orders, and engagement with detailed insights.",
    link: "/dashboard"
  }
];

export const FeaturesGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 pb-6 border-b border-border/50">
          <div>
            <span className="text-label mb-2 block">CAPABILITIES</span>
            <h2 className="text-h2">Platform Features</h2>
          </div>
          <p className="text-body text-muted-foreground max-w-md">
            End-to-end tooling for fashion design, production, and delivery.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => navigate(feature.link)}
              className="group p-6 bg-background hover:bg-card cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-metadata text-muted-foreground">{feature.id}</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
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
