
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const CustomerTutorials = () => {
  const navigate = useNavigate();
  // Sample tutorials data - would normally be fetched from an API
  const platformTutorials = [
    {
      id: 1,
      title: "Navigating the Marketplace",
      description: "Learn how to search and filter products to find exactly what you want.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
      duration: "5 min"
    },
    {
      id: 2,
      title: "Finding the Right Creator",
      description: "Tips on how to evaluate creators and choose the right one for your needs.",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000",
      duration: "7 min"
    },
    {
      id: 3,
      title: "Understanding Product Customization",
      description: "How to request customizations for the designs you love.",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1000",
      duration: "6 min"
    }
  ];

  const productTutorials = [
    {
      id: 4,
      title: "Caring for Handcrafted Furniture",
      description: "Learn how to maintain and care for artisanal furniture pieces.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000",
      duration: "8 min"
    },
    {
      id: 5,
      title: "Styling Tips for Home Decor",
      description: "How to incorporate handcrafted pieces into your home decor.",
      image: "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?q=80&w=1000",
      duration: "10 min"
    },
    {
      id: 6,
      title: "Understanding Material Quality",
      description: "A guide to different materials and their qualities in artisanal products.",
      image: "https://images.unsplash.com/photo-1573883435446-08d7e53e2b49?q=80&w=1000",
      duration: "12 min"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Learning Center</h2>
        <p className="text-muted-foreground">
          Discover tutorials and guides to help you make the most of our platform and products.
        </p>
      </div>

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platform">Using the Platform</TabsTrigger>
          <TabsTrigger value="products">Product Knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformTutorials.map(tutorial => (
              <Card key={tutorial.id} className="overflow-hidden">
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src={tutorial.image} 
                    alt={tutorial.title} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                    {tutorial.duration}
                  </div>
                </AspectRatio>
                <CardHeader>
                  <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary hover:underline font-medium"
                    onClick={() => navigate(`/tutorials/${tutorial.id}`)}
                  >
                    Watch Tutorial →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productTutorials.map(tutorial => (
              <Card key={tutorial.id} className="overflow-hidden">
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src={tutorial.image} 
                    alt={tutorial.title} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                    {tutorial.duration}
                  </div>
                </AspectRatio>
                <CardHeader>
                  <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary hover:underline font-medium"
                    onClick={() => navigate(`/tutorials/${tutorial.id}`)}
                  >
                    Watch Tutorial →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Our support team is here to assist you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              If you have specific questions or need personalized assistance,
              don't hesitate to reach out to our customer support team.
            </p>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/support')}>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
