
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Palette, ArrowRight } from "lucide-react";

const JoinUs = () => {
  return (
    <MainLayout
      seo={{
        title: "Join Us | Create2Make",
        description: "Join our creative community as a manufacturer or artisan and connect with creators worldwide.",
        ogImage: "https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png"
      }}
    >
      <div className="container px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Join Our Creative Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're a skilled artisan or a manufacturer, become part of our platform and connect with creators worldwide.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="glass-card group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">For Manufacturers</CardTitle>
              <CardDescription className="text-base">
                Scale your production by partnering with creators and designers seeking manufacturing services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Connect with global customers</li>
                <li>• Showcase your manufacturing capabilities</li>
                <li>• Streamlined order management</li>
                <li>• Grow your business reach</li>
              </ul>
              <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                <Link to="/join/manufacturer">
                  Join as Manufacturer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">For Artisans</CardTitle>
              <CardDescription className="text-base">
                Share your craft with the world and connect with customers who value handmade quality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Showcase your unique creations</li>
                <li>• Connect with appreciative customers</li>
                <li>• Build your artisan business</li>
                <li>• Preserve traditional crafts</li>
              </ul>
              <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                <Link to="/join/artisan">
                  Join as Artisan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default JoinUs;
