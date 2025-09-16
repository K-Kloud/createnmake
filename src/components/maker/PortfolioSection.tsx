import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Image as ImageIcon } from "lucide-react";

interface PortfolioSectionProps {
  portfolioItems?: any[];
}

export const PortfolioSection = ({ portfolioItems }: PortfolioSectionProps) => {
  if (!portfolioItems || portfolioItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">No portfolio items available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
        <CardDescription>Recent work and projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {portfolioItems.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Portfolio Image */}
                  {(item.productimage || item.generatedImage) && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img 
                        src={item.productimage || item.generatedImage} 
                        alt={item.description || 'Portfolio item'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Description */}
                  {item.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <CalendarDays className="h-3 w-3" />
                    Portfolio item
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};