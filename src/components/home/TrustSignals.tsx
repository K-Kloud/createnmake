import { Shield, Clock, Award, HeartHandshake } from "lucide-react";

const signals = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Protected transactions with escrow support"
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Quick quotes and efficient production"
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Vetted artisans with proven track records"
  },
  {
    icon: HeartHandshake,
    title: "Direct Connection",
    description: "Work directly with skilled craftspeople"
  }
];

export const TrustSignals = () => {
  return (
    <section className="py-12 border-y border-border/30 bg-card/30">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {signals.map((signal, index) => (
            <div 
              key={signal.title}
              className="flex flex-col items-center text-center group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                <signal.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{signal.title}</h3>
              <p className="text-sm text-muted-foreground">{signal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
