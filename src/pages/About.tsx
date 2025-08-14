import { Helmet } from "react-helmet";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Heart, 
  Users, 
  Rocket,
  Award,
  Globe,
  Lightbulb,
  Shield
} from "lucide-react";

const About = () => {
  const { t } = useTranslation('common');

  const values = [
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Innovation",
      description: "We're constantly pushing the boundaries of what's possible with AI image generation."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community",
      description: "Building a supportive ecosystem where creators can share, learn, and grow together."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safety",
      description: "Ensuring responsible AI use with built-in content moderation and ethical guidelines."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Accessibility",
      description: "Making advanced AI technology accessible to creators of all skill levels worldwide."
    }
  ];

  const stats = [
    { number: "100K+", label: "Images Generated" },
    { number: "10K+", label: "Active Users" },
    { number: "50+", label: "Countries" },
    { number: "99.9%", label: "Uptime" }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "Former AI researcher at Google, passionate about democratizing creative AI tools."
    },
    {
      name: "Marcus Johnson", 
      role: "CTO",
      bio: "Full-stack engineer with 10+ years experience building scalable AI platforms."
    },
    {
      name: "Elena Rodriguez",
      role: "Head of Design",
      bio: "Award-winning designer focused on creating intuitive user experiences."
    },
    {
      name: "David Kim",
      role: "Head of AI",
      bio: "PhD in Machine Learning, specializing in generative models and computer vision."
    }
  ];

  return (
    <MainLayout>
      <Helmet>
        <title>About Us - OpenTeknologies AI Platform</title>
        <meta 
          name="description" 
          content="Learn about our mission to democratize AI image generation and make creative tools accessible to everyone."
        />
        <meta name="keywords" content="about, OpenTeknologies, AI image generation, team, mission, values" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
              About OpenTeknologies
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're on a mission to democratize AI-powered creativity and make advanced image generation 
              accessible to everyone, from professional designers to curious beginners.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  We believe that everyone should have access to powerful creative tools. Our platform 
                  combines cutting-edge AI technology with an intuitive interface to help creators 
                  bring their visions to life, regardless of their technical background.
                </p>
                <div className="flex items-center">
                  <Heart className="h-6 w-6 text-red-500 mr-2" />
                  <span className="text-sm font-medium">Built with passion by creators, for creators</span>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-primary-variant/20 rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto p-3 bg-primary/10 rounded-lg text-primary w-fit mb-4">
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">
                The brilliant minds behind OpenTeknologies
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary-variant/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <Badge variant="secondary">{member.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Rocket className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-bold">Powered by Cutting-Edge Technology</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Our platform leverages the latest advances in AI and machine learning to deliver 
              exceptional image generation capabilities. We use state-of-the-art models like 
              Flux and Stable Diffusion, optimized for speed, quality, and reliability.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {["Flux AI", "Stable Diffusion", "React", "Supabase"].map((tech, index) => (
                <div key={index} className="p-4 bg-background rounded-lg border">
                  <div className="font-semibold">{tech}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Join Our Community?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your creative journey today and become part of a growing community of AI-powered creators
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => window.location.href = '/'}
              >
                Get Started
              </button>
              <button 
                className="btn btn-outline btn-lg"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default About;