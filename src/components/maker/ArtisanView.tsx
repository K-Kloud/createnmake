
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Artisan } from "@/types/maker";
import { useMakeRequests } from "@/hooks/useMakeRequests";
import { useArtisanPortfolio } from "@/hooks/useArtisanPortfolio";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, User, Package, Image, Star } from "lucide-react";
import { ArtisanPortfolioSection } from "./ArtisanPortfolioSection";

interface ArtisanViewProps {
  artisan: Artisan;
}

export const ArtisanView = ({ artisan }: ArtisanViewProps) => {
  const { data: makeRequests = [], isLoading } = useMakeRequests(artisan.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{artisan.business_name || artisan.username}</h1>
        <p className="mb-6">Artisan Profile</p>
        
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            {artisan.avatar_url ? (
              <img src={artisan.avatar_url} alt="Profile" className="w-16 h-16 rounded-full mr-4" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <span className="text-xl font-bold">
                  {(artisan.business_name || artisan.username || "A").charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{artisan.business_name || artisan.username}</h2>
              <p className="text-muted-foreground">{artisan.business_type || "Artisan"}</p>
            </div>
          </div>
          
          {artisan.specialties && artisan.specialties.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {artisan.specialties.map((specialty: string) => (
                  <span
                    key={specialty}
                    className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {artisan.bio && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Bio</h3>
              <p>{artisan.bio}</p>
            </div>
          )}
        </div>
        
        {/* Portfolio and Requests Sections */}
        <div className="mt-8 space-y-8">
          {/* Portfolio Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Portfolio & Made Items
            </h2>
            <ArtisanPortfolioSection artisanId={artisan.id} />
          </div>

          {/* Make Requests Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Make Requests ({makeRequests.length})
            </h2>
          
          {isLoading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : makeRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No make requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {makeRequests.map((request: any) => {
                const productDetails = typeof request.product_details === 'string' 
                  ? JSON.parse(request.product_details) 
                  : request.product_details;
                
                return (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {productDetails.title || 'Custom Design Request'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <User className="h-4 w-4" />
                            Request from {request.profiles?.display_name || request.profiles?.username || 'Unknown User'}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'in_progress' ? 'default' :
                          request.status === 'completed' ? 'default' : 'destructive'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Product Image */}
                        {productDetails.url && (
                          <div>
                            <p className="text-sm font-medium mb-2">Product Design:</p>
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                              <img 
                                src={productDetails.url} 
                                alt={productDetails.title || 'Product design'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Product Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {productDetails.description && (
                            <div>
                              <p className="text-sm font-medium">Description:</p>
                              <p className="text-sm text-muted-foreground">{productDetails.description}</p>
                            </div>
                          )}
                          
                          {productDetails.price && (
                            <div>
                              <p className="text-sm font-medium">Original Price:</p>
                              <p className="text-sm text-muted-foreground">£{productDetails.price}</p>
                            </div>
                          )}
                          
                          {productDetails.category && (
                            <div>
                              <p className="text-sm font-medium">Category:</p>
                              <Badge variant="outline">{productDetails.category}</Badge>
                            </div>
                          )}
                          
                          {productDetails.prompt && (
                            <div>
                              <p className="text-sm font-medium">Design Prompt:</p>
                              <p className="text-sm text-muted-foreground">{productDetails.prompt}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Tags */}
                        {productDetails.tags && productDetails.tags.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {productDetails.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Additional Details */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {productDetails.likes && (
                            <div>
                              <p className="font-medium">Likes:</p>
                              <p className="text-muted-foreground">{productDetails.likes}</p>
                            </div>
                          )}
                          {productDetails.views && (
                            <div>
                              <p className="font-medium">Views:</p>
                              <p className="text-muted-foreground">{productDetails.views}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                          <CalendarDays className="h-3 w-3" />
                          Requested on {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
