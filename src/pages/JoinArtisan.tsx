
import { useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Palette, Users, TrendingUp, Heart, Sparkles, Globe } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/hooks/useAuth";

const JoinArtisan = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();

  const benefits = [
    {
      icon: Palette,
      title: "Showcase Your Craft",
      description: "Display your unique creations and artistic skills to a global audience"
    },
    {
      icon: Users,
      title: "Connect with Customers",
      description: "Build relationships with customers who value handmade, custom work"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Art Business",
      description: "Turn your passion into profit with our supportive platform"
    },
    {
      icon: Heart,
      title: "Preserve Traditional Crafts",
      description: "Keep traditional skills alive while reaching modern customers"
    },
    {
      icon: Sparkles,
      title: "Creative Freedom",
      description: "Work on projects that inspire you and challenge your skills"
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Reach customers from around the world who appreciate handmade quality"
    }
  ];

  const crafts = [
    "Pottery & Ceramics",
    "Jewelry Making",
    "Woodworking",
    "Textile Arts",
    "Leather Crafting",
    "Glassblowing",
    "Metalworking",
    "Embroidery & Needlework",
    "Basket Weaving",
    "Stone Carving",
    "Calligraphy",
    "Paper Arts",
    "Beadwork",
    "Candle Making",
    "Soap Making"
  ];

  return (
    <MainLayout
      seo={{
        title: "Join as an Artisan | OpenTeknologies",
        description: "Share your craft with the world. Connect with customers who value handmade, custom creations. Join our community of skilled artisans."
      }}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Join as an Artisan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Share your craft with the world. Connect with customers who appreciate the beauty 
            and quality of handmade creations. Turn your artistic passion into a thriving business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link to="/artisan/onboarding">Start Your Artisan Profile</Link>
              </Button>
            ) : (
              <Button size="lg" onClick={() => setShowAuthDialog(true)}>
                Get Started Today
              </Button>
            )}
            <Button variant="outline" size="lg" asChild>
              <Link to="/marketplace">Browse Existing Artisans</Link>
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

        {/* Craft Specialties */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Crafts We Celebrate</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {crafts.map((craft, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                {craft}
              </Badge>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="glass-card mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">How It Works</CardTitle>
            <CardDescription className="text-center text-lg">
              Simple steps to start sharing your craft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                <p className="text-muted-foreground">Showcase your craft, skills, and unique artistic style</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect with Customers</h3>
                <p className="text-muted-foreground">Receive custom orders from customers who value handmade quality</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Build Your Business</h3>
                <p className="text-muted-foreground">Create beautiful pieces, earn income, and grow your artisan business</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Craft?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join a community of skilled artisans and connect with customers who appreciate handmade quality
          </p>
          {user ? (
            <Button size="lg" asChild>
              <Link to="/artisan/onboarding">Complete Your Artisan Profile</Link>
            </Button>
          ) : (
            <Button size="lg" onClick={() => setShowAuthDialog(true)}>
              Sign Up as an Artisan
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

export default JoinArtisan;
