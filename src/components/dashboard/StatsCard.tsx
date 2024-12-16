import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  onClick?: () => void;
}

export const StatsCard = ({ title, value, onClick }: StatsCardProps) => {
  return (
    <Card 
      className={`glass-card ${onClick ? 'cursor-pointer hover:bg-accent/10 transition-colors' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};