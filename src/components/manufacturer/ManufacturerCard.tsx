import { Star, Quote, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ManufacturerCardProps {
  name: string;
  type: string;
  description: string;
  rating: number;
  reviews: Review[];
  image: string;
  location: string;
  specialties: string[];
  producedItems?: {
    id: number;
    generatedImage: string;
    productImage: string;
    description: string;
  }[];
}

export const ManufacturerCard = ({
  name,
  type,
  description,
  rating,
  reviews,
  image,
  location,
  specialties,
  producedItems = [
    {
      id: 1,
      generatedImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35",
      productImage: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e",
      description: "Custom tailored suit"
    },
    {
      id: 2,
      generatedImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35",
      productImage: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e",
      description: "Bespoke dress shirt"
    },
    {
      id: 3,
      generatedImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35",
      productImage: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e",
      description: "Custom leather shoes"
    }
  ],
}: ManufacturerCardProps) => {
  const { toast } = useToast();

  const handleQuoteRequest = () => {
    toast({
      title: "Quote Requested",
      description: `Your quote request has been sent to ${name}. They will contact you shortly.`,
    });
  };

  return (
    <Card className="glass-card hover:scale-[1.02] transition-transform">
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src={image}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <CardTitle className="text-xl">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
          <Button 
            onClick={handleQuoteRequest}
            className="flex items-center gap-2"
          >
            <Quote className="w-4 h-4" />
            Request Quote
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">({reviews.length} reviews)</span>
            </div>
            
            {producedItems.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Portfolio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl">
                  <DialogHeader>
                    <DialogTitle>{name}'s Portfolio</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 mt-4">
                    {producedItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-2 gap-4 p-4 glass-card">
                        <div className="space-y-2">
                          <h3 className="font-semibold">Generated Design</h3>
                          <div className="relative aspect-video">
                            <img
                              src={item.generatedImage}
                              alt="Generated design"
                              className="absolute inset-0 w-full h-full object-cover rounded-md"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold">Manufactured Product</h3>
                          <div className="relative aspect-video">
                            <img
                              src={item.productImage}
                              alt="Manufactured product"
                              className="absolute inset-0 w-full h-full object-cover rounded-md"
                            />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-center text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <p className="text-sm">{description}</p>
          
          <div className="text-sm">
            <p className="text-muted-foreground">Location: {location}</p>
            <div className="mt-2">
              <p className="text-muted-foreground">Specialties:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Recent Reviews</h4>
            {reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.user}</span>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};