
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const CreatorEducation = () => {
  const [category, setCategory] = useState("design");

  // Sample resources data - would be fetched from API in real app
  const designResources = [
    {
      id: 1,
      title: "Principles of Good Product Design",
      description: "Learn the fundamental principles that make designs attractive and functional.",
      image: "https://images.unsplash.com/photo-1623625434462-e5e42318ae49?q=80&w=1000",
      link: "#",
      type: "article"
    },
    {
      id: 2,
      title: "Color Theory for Product Designers",
      description: "Understand how to use color effectively in your product designs.",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000",
      link: "#",
      type: "video"
    },
    {
      id: 3,
      title: "Material Selection Guide",
      description: "How to choose the right materials for different types of products.",
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1000",
      link: "#",
      type: "guide"
    },
  ];

  const marketingResources = [
    {
      id: 4,
      title: "Product Photography Tips",
      description: "Learn how to take professional photos of your products that sell.",
      image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000",
      link: "#",
      type: "tutorial"
    },
    {
      id: 5,
      title: "Writing Product Descriptions That Sell",
      description: "Craft compelling product descriptions that drive conversions.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000",
      link: "#",
      type: "article"
    },
    {
      id: 6,
      title: "Social Media Marketing for Designers",
      description: "Strategies for promoting your designs on social media platforms.",
      image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000",
      link: "#",
      type: "video"
    },
  ];

  const businessResources = [
    {
      id: 7,
      title: "Pricing Your Designs",
      description: "Learn how to price your products for maximum profit.",
      image: "https://images.unsplash.com/photo-1563986768711-b3bde3dc821e?q=80&w=1000",
      link: "#",
      type: "guide"
    },
    {
      id: 8,
      title: "Understanding Creator Earnings",
      description: "A breakdown of how creators earn money on the platform.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000",
      link: "#",
      type: "article"
    },
    {
      id: 9,
      title: "Building Your Brand as a Designer",
      description: "Strategies for creating a strong, recognizable brand.",
      image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=1000",
      link: "#",
      type: "video"
    },
  ];

  // Get the appropriate resources based on the selected category
  const resources = 
    category === "design" ? designResources :
    category === "marketing" ? marketingResources :
    businessResources;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Creator Learning Hub</h2>
        <p className="text-muted-foreground">
          Explore resources to help you succeed as a creator on our platform.
        </p>
      </div>
      
      <Tabs defaultValue="design" value={category} onValueChange={setCategory} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="design">Design Skills</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
        
        <TabsContent value={category} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map(resource => (
              <Card key={resource.id} className="overflow-hidden">
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src={resource.image} 
                    alt={resource.title} 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href={resource.link}
                    className="text-primary hover:underline font-medium"
                  >
                    View Resource →
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Creator Community</CardTitle>
          <CardDescription>Connect with other creators to share tips and get inspired.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Join our creator community forums to connect with fellow designers, ask questions,
              and share your experiences. Learning from each other is one of the best ways to grow!
            </p>
            <Button variant="outline" className="w-full sm:w-auto">
              Join Creator Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
