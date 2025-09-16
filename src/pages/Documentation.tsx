import { Helmet } from "react-helmet";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Book, 
  Code, 
  Zap, 
  Palette,
  Settings,
  Shield,
  Database,
  ExternalLink,
  Download,
  PlayCircle
} from "lucide-react";

const Documentation = () => {
  const navigate = useNavigate();
  const sections = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Getting Started",
      description: "Quick start guides and basic concepts",
      badge: "Beginner",
      topics: [
        "Creating your first image",
        "Understanding prompts",
        "Account setup",
        "Basic navigation"
      ]
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Advanced Features",
      description: "Master advanced image generation techniques",
      badge: "Intermediate",
      topics: [
        "Style modifiers",
        "Image editing",
        "Batch generation",
        "Custom models"
      ]
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "API Reference",
      description: "Complete API documentation for developers",
      badge: "Developer",
      topics: [
        "Authentication",
        "Endpoints",
        "SDKs",
        "Rate limits"
      ]
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Integration Guides",
      description: "Connect with your favorite tools and platforms",
      badge: "Integration",
      topics: [
        "Webhooks",
        "Third-party tools",
        "Workflow automation",
        "Custom integrations"
      ]
    }
  ];

  const quickLinks = [
    {
      icon: <PlayCircle className="h-5 w-5" />,
      title: "5-Minute Quickstart",
      description: "Get up and running in minutes"
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "API Playground",
      description: "Test API calls interactively"
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "SDK Downloads",
      description: "Official libraries and tools"
    },
    {
      icon: <Book className="h-5 w-5" />,
      title: "Tutorials",
      description: "Step-by-step learning guides"
    }
  ];

  const apiExamples = [
    {
      title: "Generate Image",
      description: "Basic image generation with prompt",
      code: `curl -X POST "https://api.openteknologies.com/v1/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "model": "flux-schnell",
    "width": 1024,
    "height": 1024
  }'`
    },
    {
      title: "Check Generation Status",
      description: "Monitor generation progress",
      code: `curl -X GET "https://api.openteknologies.com/v1/generate/{id}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    }
  ];

  return (
    <MainLayout>
      <Helmet>
        <title>Documentation - OpenTeknologies Developer Guide</title>
        <meta 
          name="description" 
          content="Complete documentation for OpenTeknologies AI platform. API reference, guides, tutorials, and examples for developers."
        />
        <meta name="keywords" content="documentation, API, guides, tutorials, OpenTeknologies, developers, integration" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                Documentation
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Everything you need to integrate and build with OpenTeknologies AI platform. 
                From getting started guides to advanced API references.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {quickLinks.map((link, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {link.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{link.title}</h3>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Documentation Sections */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Documentation Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sections.map((section, index) => (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {section.icon}
                      </div>
                      <Badge variant="secondary">{section.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <p className="text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                          {topic}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-4" variant="outline">
                      View Section <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* API Examples */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">API Examples</h2>
              <p className="text-xl text-muted-foreground">
                Get started quickly with these code examples
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {apiExamples.map((example, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      {example.title}
                    </CardTitle>
                    <p className="text-muted-foreground">{example.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-background rounded-lg p-4 border">
                      <pre className="text-sm overflow-x-auto">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                    <Button className="mt-4" variant="outline" size="sm">
                      Copy Code
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Additional Resources</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <CardTitle>Security Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Best practices for secure API usage and data protection
                  </p>
                  <Button variant="outline" size="sm">Learn More</Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Database className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <CardTitle>Data Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Complete reference for all API data structures
                  </p>
                  <Button variant="outline" size="sm">View Reference</Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <PlayCircle className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <CardTitle>Video Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Step-by-step video guides for all features
                  </p>
                  <Button variant="outline" size="sm">Watch Now</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Need Help?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is here to help
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/support')}>
                Visit Support Center
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Documentation;