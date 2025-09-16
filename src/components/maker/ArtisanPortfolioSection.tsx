import { useArtisanPortfolio } from "@/hooks/useArtisanPortfolio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Image as ImageIcon, Star, DollarSign } from "lucide-react";

interface ArtisanPortfolioSectionProps {
  artisanId: string;
}

export const ArtisanPortfolioSection = ({ artisanId }: ArtisanPortfolioSectionProps) => {
  const { data: portfolioItems = [], isLoading } = useArtisanPortfolio(artisanId);

  if (isLoading) {
    return <div className="text-center py-8">Loading portfolio...</div>;
  }

  if (portfolioItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No portfolio items yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {portfolioItems.map((item: any) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <ImageIcon className="h-4 w-4" />
                  {item.project_type || 'Portfolio Item'}
                </CardDescription>
              </div>
              {item.is_featured && (
                <Badge variant="default" className="bg-primary/10 text-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Portfolio Image */}
              {item.image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
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
              
              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.client_name && (
                  <div>
                    <p className="text-sm font-medium">Client:</p>
                    <p className="text-sm text-muted-foreground">{item.client_name}</p>
                  </div>
                )}
                
                {item.project_value && (
                  <div>
                    <p className="text-sm font-medium">Value:</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      £{item.project_value}
                    </p>
                  </div>
                )}
                
                {item.completion_date && (
                  <div>
                    <p className="text-sm font-medium">Completed:</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.completion_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Materials Used */}
              {item.materials_used && item.materials_used.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Materials:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.materials_used.map((material: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <CalendarDays className="h-3 w-3" />
                Added on {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};