
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  href?: string;
}

export const StatsCard = ({ title, value, icon: Icon, description, href }: StatsCardProps) => {
  const CardComponent = href ? Link : "div";
  const cardProps = href ? { to: href } : {};

  return (
    <CardComponent
      {...cardProps}
      className={`block ${href ? 'cursor-pointer hover:bg-accent/10 transition-colors' : ''}`}
    >
      <Card className="glass-card h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </CardContent>
      </Card>
    </CardComponent>
  );
};
