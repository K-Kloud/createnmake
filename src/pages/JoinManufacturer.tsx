
import { useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Factory, Users, TrendingUp, Wrench, Package, Globe } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/hooks/useAuth";

const JoinManufacturer = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();

  const benefits = [
    {
      icon: Factory,
      title: "Scale Your Production",
      description: "Access a network of customers seeking custom manufacturing services"
    },
    {
      icon: Users,
      title: "Connect with Creators",
      description: "Partner with designers and creators to bring their visions to life"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Expand your reach and increase revenue through our platform"
    },
    {
      icon: Wrench,
      title: "Showcase Your Expertise",
      description: "Highlight your specialties and manufacturing capabilities"
    },
    {
      icon: Package,
      title: "Streamlined Orders",
      description: "Manage orders and communications through our integrated platform"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with customers and creators from around the world"
    }
  ];

  const specialties = [
    "Custom Furniture Manufacturing",
    "Metal Fabrication",
    "3D Printing Services",
    "Textile & Apparel Manufacturing",
    "Woodworking & Carpentry",
    "Electronics Manufacturing",
    "Jewelry Manufacturing",
    "Automotive Parts",
    "Industrial Components",
    "Prototype Development"
  ];

  return (
    <MainLayout
      seo={{
        title: "Join as a Manufacturer | Create2Make",
        description: "Partner with creators and designers to provide custom manufacturing services. Grow your manufacturing business with Create2Make."
      }}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Join as a Manufacturer
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Partner with creators and designers to bring their custom products to life. 
            Expand your manufacturing business and connect with a global network of innovators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link to="/manufacturer/onboarding">Start Your Manufacturer Profile</Link>
              </Button>
            ) : (
              <Button size="lg" onClick={() => setShowAuthDialog(true)}>
                Get Started Today
              </Button>
            )}
            <Button variant="outline" size="lg" asChild>
              <Link to="/marketplace">Browse Existing Manufacturers</Link>
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="glass-card">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{benefit.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Manufacturing Specialties */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Manufacturing Specialties We Support</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="glass-card mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">How It Works</CardTitle>
            <CardDescription className="text-center text-lg">
              Simple steps to start your manufacturing journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                <p className="text-muted-foreground">Set up your manufacturer profile with specialties, capabilities, and portfolio</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect with Creators</h3>
                <p className="text-muted-foreground">Receive custom manufacturing requests from designers and creators</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Grow Your Business</h3>
                <p className="text-muted-foreground">Fulfill orders, build relationships, and expand your manufacturing reach</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of manufacturers already growing their business with Create2Make
          </p>
          {user ? (
            <Button size="lg" asChild>
              <Link to="/manufacturer/onboarding">Complete Your Manufacturer Profile</Link>
            </Button>
          ) : (
            <Button size="lg" onClick={() => setShowAuthDialog(true)}>
              Sign Up as a Manufacturer
            </Button>
          )}
        </div>
      </div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </MainLayout>
  );
};

export default JoinManufacturer;
