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
  producedItems?: { id: number; image: string; description: string }[];
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
  producedItems = [],
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
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{name}'s Portfolio</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Generated Designs</h3>
                      <div className="grid gap-4">
                        {producedItems.slice(0, Math.ceil(producedItems.length / 2)).map((item) => (
                          <div key={item.id} className="relative group">
                            <img
                              src={item.image}
                              alt={item.description}
                              className="w-full h-48 object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <p className="text-sm text-white p-3">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Manufactured Items</h3>
                      <div className="grid gap-4">
                        {producedItems.slice(Math.ceil(producedItems.length / 2)).map((item) => (
                          <div key={item.id} className="relative group">
                            <img
                              src={item.image}
                              alt={item.description}
                              className="w-full h-48 object-cover rounded-md"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <p className="text-sm text-white p-3">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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