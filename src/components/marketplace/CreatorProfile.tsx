
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StarIcon, MessageSquare, Heart, Image, Package, DollarSign, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { CreatorRatings } from "./CreatorRatings";
import { GalleryImage } from "@/types/gallery";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { useCreatorPortfolio } from "@/hooks/useCreatorPortfolio";
import { useFollowStatus } from "@/hooks/useFollowStatus";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";

interface CreatorProfileProps {
  creatorId: string;
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onMessage: (creatorId: string) => void;
}

export const CreatorProfile = ({ 
  creatorId,
  onLike,
  onView,
  onMessage
}: CreatorProfileProps) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  // Fetch creator data using hooks
  const { data: creator, isLoading: profileLoading } = useCreatorProfile(creatorId);
  const { data: stats, isLoading: statsLoading } = useCreatorStats(creatorId);
  const { data: portfolio, isLoading: portfolioLoading } = useCreatorPortfolio(creatorId, 6);
  const { isFollowing, toggleFollow, isToggling } = useFollowStatus(creatorId);

  const handleMessage = () => {
    onMessage(creatorId);
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    onView(image.id);
  };

  if (profileLoading) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">View Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!creator) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">View Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <div className="text-center p-8">
            <p>Creator not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Creator Profile</DialogTitle>
          <DialogDescription>
            Learn more about this creator and their work
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Creator Info */}
          <div className="col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-2">
                  <AvatarImage src={creator.avatar_url || ''} alt={creator.display_name || 'Creator'} />
                  <AvatarFallback>{(creator.display_name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{creator.display_name || 'Anonymous Creator'}</CardTitle>
                <CardDescription>Member since {new Date(creator.created_at).getFullYear()}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {creator.bio && <p className="text-sm">{creator.bio}</p>}
                
                {statsLoading ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-md" />
                    ))}
                  </div>
                ) : stats && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Users className="h-4 w-4 mb-1" />
                      <span className="text-xs text-muted-foreground">Followers</span>
                      <span className="font-medium">{stats.followers_count}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Image className="h-4 w-4 mb-1" />
                      <span className="text-xs text-muted-foreground">Designs</span>
                      <span className="font-medium">{stats.designs_count}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Heart className="h-4 w-4 mb-1" />
                      <span className="text-xs text-muted-foreground">Likes</span>
                      <span className="font-medium">{stats.total_likes}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Package className="h-4 w-4 mb-1" />
                      <span className="text-xs text-muted-foreground">Views</span>
                      <span className="font-medium">{stats.total_views}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full" 
                  variant={isFollowing ? "outline" : "default"}
                  onClick={toggleFollow}
                  disabled={isToggling}
                >
                  {isToggling ? "Loading..." : (isFollowing ? "Following" : "Follow")}
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleMessage}
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Message
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Creator Content */}
          <div className="col-span-1 md:col-span-2">
            <Tabs defaultValue="portfolio">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio" className="mt-4">
                {portfolioLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {portfolio?.map((design) => (
                      <div 
                        key={design.id} 
                        className="aspect-square relative rounded-md overflow-hidden cursor-pointer"
                        onClick={() => handleImageClick(design)}
                      >
                        <img 
                          src={design.url} 
                          alt={design.prompt} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        {design.price && (
                          <Badge className="absolute bottom-2 right-2 bg-background/80">
                            {design.price}
                          </Badge>
                        )}
                        <div className="absolute top-2 right-2 flex items-center space-x-2">
                          <Badge variant="outline" className="bg-background/80">
                            <Heart className="h-3 w-3 mr-1" fill="currentColor" />
                            {design.likes}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <CreatorRatings creatorId={creatorId} />
              </TabsContent>
              
              <TabsContent value="achievements" className="mt-4">
                {statsLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-md" />
                    ))}
                  </div>
                ) : stats && (
                  <div className="grid grid-cols-2 gap-3">
                    {stats.designs_count >= 10 && (
                      <Badge variant="outline" className="flex items-center justify-center p-4">
                        <Image className="mr-2 h-4 w-4" /> Prolific Creator
                      </Badge>
                    )}
                    {stats.total_likes >= 100 && (
                      <Badge variant="outline" className="flex items-center justify-center p-4">
                        <Heart className="mr-2 h-4 w-4 fill-red-500" /> Popular Designs
                      </Badge>
                    )}
                    {stats.followers_count >= 50 && (
                      <Badge variant="outline" className="flex items-center justify-center p-4">
                        <Users className="mr-2 h-4 w-4" /> Growing Community
                      </Badge>
                    )}
                    {stats.total_views >= 1000 && (
                      <Badge variant="outline" className="flex items-center justify-center p-4">
                        <Package className="mr-2 h-4 w-4" /> High Visibility
                      </Badge>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
