
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle } from "lucide-react";
import { GalleryImage } from "@/types/gallery";
import { CreatorProfile } from "../CreatorProfile";

interface ProductTabsProps {
  product: GalleryImage;
  similarProducts: GalleryImage[];
  onLike: (imageId: number) => void;
}

export const ProductTabs = ({ product, similarProducts, onLike }: ProductTabsProps) => {
  return (
    <Tabs defaultValue="details">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Description</h3>
          <p className="text-sm">{product.prompt}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Creator</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={product.creator.avatar} alt={product.creator.name} />
                <AvatarFallback>{product.creator.name[0]}</AvatarFallback>
              </Avatar>
              <span>{product.creator.name}</span>
            </div>
            <CreatorProfile 
              creator={{
                id: product.user_id,
                name: product.creator.name,
                avatar: product.creator.avatar,
                bio: "Passionate designer creating unique pieces that blend style and functionality.",
                followers: 256,
                joined: "Jan 2023",
                rating: 4.8,
                reviewCount: 45,
                totalSales: 112,
                earnings: 5600,
                designs: 37
              }} 
              creatorDesigns={[product, ...similarProducts]} 
              onLike={onLike} 
              onView={() => {}} 
              onFollow={() => {}} 
              onMessage={() => {}} 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Fashion</Badge>
            <Badge variant="outline">Handmade</Badge>
            <Badge variant="outline">Modern</Badge>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="shipping" className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Shipping Information</h3>
          <ul className="space-y-2 text-sm">
            <li>• Estimated delivery: 5-7 business days</li>
            <li>• Free shipping on orders over $50</li>
            <li>• International shipping available</li>
            <li>• Express shipping options available at checkout</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Return Policy</h3>
          <p className="text-sm">Returns accepted within 30 days of delivery if item is unused and in original packaging.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="reviews" className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">4.0</div>
          <div className="flex-grow">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-5 w-5 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
            </div>
            <div className="text-sm text-muted-foreground">Based on 12 reviews</div>
          </div>
        </div>
        
        <Button variant="outline" className="w-full">
          <MessageCircle className="mr-2 h-4 w-4" /> Write a Review
        </Button>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Jane Doe</div>
                  <div className="text-xs text-muted-foreground">2 weeks ago</div>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
              </div>
            </div>
            <p className="text-sm">The quality exceeded my expectations! The design is stunning and the product arrived quickly. Highly recommend this creator's work.</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Robert Smith</div>
                  <div className="text-xs text-muted-foreground">1 month ago</div>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
              </div>
            </div>
            <p className="text-sm">Very nice design and good quality. Shipping was a bit slow but the product is worth the wait.</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
