import { Lightbulb, Palette, ShoppingBag } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: Lightbulb,
      title: "Generate",
      description: "Create unique designs using our AI-powered generator with custom prompts."
    },
    {
      icon: Palette,
      title: "Customize", 
      description: "Refine your designs with professional tools and preview options."
    },
    {
      icon: ShoppingBag,
      title: "Produce",
      description: "Connect with skilled artisans to bring your designs to life as physical products."
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Transform your ideas into reality in three simple steps
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 bg-primary-light/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border -translate-x-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};