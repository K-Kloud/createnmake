import { MainLayout } from "@/components/layouts/MainLayout";
import { DynamicContent } from "@/components/dynamic/DynamicContent";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  // Fallback testimonial data in case dynamic content is not available
  const fallbackTestimonials = [
    {
      name: "Sarah Johnson",
      role: "Digital Artist",
      content: "OpenT has revolutionized my creative process. The quality of generated images is outstanding!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      name: "Michael Chen",
      role: "Marketing Director",
      content: "We use OpenT for all our marketing visuals now. It's fast, efficient, and the results are amazing.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      name: "Emma Wilson",
      role: "Game Developer",
      content: "The variety of styles available is incredible. Perfect for concept art and prototyping.",
      rating: 4,
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      name: "David Park",
      role: "Content Creator",
      content: "OpenT has saved me countless hours in content creation. The AI understands exactly what I need.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  ];

  return (
    <MainLayout
      seo={{
        title: "Customer Testimonials",
        description: "Read what our customers say about our AI-powered image generation platform.",
        canonicalUrl: `${window.location.origin}/testimonials`,
        keywords: ["testimonials", "reviews", "customers", "feedback", "AI", "image generation"]
      }}
    >
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Testimonials</h1>
        
        {/* Try to load dynamic content first */}
        <DynamicContent blockKey="testimonials_section" className="mb-8" />
        
        {/* Fallback static content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fallbackTestimonials.map((testimonial, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{testimonial.content}</p>
                <div className="flex space-x-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Testimonials;