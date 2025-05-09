
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StarIcon, MessageSquare, Heart, Image, Package, DollarSign, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { MarketplaceGrid } from "./MarketplaceGrid";
import { CreatorRatings } from "./CreatorRatings";
import { GalleryImage } from "@/types/gallery";

interface CreatorProfileProps {
  creator: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    followers: number;
    joined: string;
    rating: number;
    reviewCount: number;
    totalSales: number;
    earnings: number;
    designs: number;
  };
  creatorDesigns: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onFollow: (creatorId: string) => void;
  onMessage: (creatorId: string) => void;
}

export const CreatorProfile = ({ 
  creator, 
  creatorDesigns,
  onLike,
  onView,
  onFollow,
  onMessage
}: CreatorProfileProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow(creator.id);
  };

  const handleMessage = () => {
    onMessage(creator.id);
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    onView(image.id);
  };

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
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{creator.name}</CardTitle>
                <CardDescription>Member since {creator.joined}</CardDescription>
                
                <div className="flex items-center justify-center mt-2">
                  <StarIcon className="text-yellow-500 fill-yellow-500 h-4 w-4 mr-1" />
                  <span>{creator.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">({creator.reviewCount} reviews)</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm">{creator.bio}</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <Users className="h-4 w-4 mb-1" />
                    <span className="text-xs text-muted-foreground">Followers</span>
                    <span className="font-medium">{creator.followers}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <Image className="h-4 w-4 mb-1" />
                    <span className="text-xs text-muted-foreground">Designs</span>
                    <span className="font-medium">{creator.designs}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <Package className="h-4 w-4 mb-1" />
                    <span className="text-xs text-muted-foreground">Sales</span>
                    <span className="font-medium">{creator.totalSales}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <DollarSign className="h-4 w-4 mb-1" />
                    <span className="text-xs text-muted-foreground">Earnings</span>
                    <span className="font-medium">${creator.earnings}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full" 
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                >
                  {isFollowing ? "Following" : "Follow"}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {creatorDesigns.slice(0, 6).map((design) => (
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
                          ${design.price}
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
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <CreatorRatings creatorId={creator.id} />
              </TabsContent>
              
              <TabsContent value="achievements" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Badge variant="outline" className="flex items-center justify-center p-4">
                    <StarIcon className="mr-2 h-4 w-4 fill-yellow-500" /> Top Seller
                  </Badge>
                  <Badge variant="outline" className="flex items-center justify-center p-4">
                    <Heart className="mr-2 h-4 w-4 fill-red-500" /> Fan Favorite
                  </Badge>
                  <Badge variant="outline" className="flex items-center justify-center p-4">
                    <Users className="mr-2 h-4 w-4" /> 100+ Followers
                  </Badge>
                  <Badge variant="outline" className="flex items-center justify-center p-4">
                    <Package className="mr-2 h-4 w-4" /> 50+ Sales
                  </Badge>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
