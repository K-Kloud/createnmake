import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface AdditionalFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
}

export const AdditionalFeatureCard = ({ icon: Icon, title, description, href, onClick }: AdditionalFeatureCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <Card 
      className="glass-card hover:shadow-lg transition-shadow group cursor-pointer" 
      onClick={handleClick}
    >
      <CardContent className="p-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-primary transform group-hover:scale-110 transition-transform">
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};