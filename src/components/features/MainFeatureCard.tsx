import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface MainFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  steps: string[];
}

export const MainFeatureCard = ({ icon: Icon, title, description, steps }: MainFeatureCardProps) => {
  return (
    <Card className="glass-card hover:shadow-lg transition-shadow group">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4 transform group-hover:scale-110 transition-transform">
            <Icon className="h-12 w-12 text-primary animate-bounce-slow" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 gradient-text">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="space-y-4">
          <h4 className="font-medium text-center mb-4">How to use:</h4>
          <div className="space-y-3">
            {steps.map((step, stepIndex) => (
              <div key={stepIndex} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};