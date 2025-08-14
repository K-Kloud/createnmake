import { Helmet } from "react-helmet";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Book, 
  Mail, 
  Phone,
  Search,
  HelpCircle,
  Video,
  FileText
} from "lucide-react";

const Support = () => {
  const supportOptions = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "24/7"
    },
    {
      icon: <Book className="h-8 w-8" />,
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      action: "Browse Docs",
      available: "Always"
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      action: "Watch Videos",
      available: "On-demand"
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Support",
      description: "Detailed support via email",
      action: "Send Email",
      available: "4-hour response"
    }
  ];

  const faqs = [
    {
      question: "How do I get started with image generation?",
      answer: "Simply sign up for a free account, then use our intuitive prompt interface to describe the image you want to create. Our AI will generate it within seconds!"
    },
    {
      question: "What AI models do you support?",
      answer: "We support multiple state-of-the-art models including Flux Schnell, Flux Dev, and Stable Diffusion variants, each optimized for different use cases."
    },
    {
      question: "Can I use generated images commercially?",
      answer: "Yes! All images generated on our platform come with commercial usage rights. Check our licensing terms for specific details."
    },
    {
      question: "How do I upgrade my subscription?",
      answer: "Go to your account settings and click on 'Billing' to view available plans and upgrade options. Changes take effect immediately."
    },
    {
      question: "Is there an API available?",
      answer: "Yes, we offer a comprehensive REST API for Pro and Enterprise users. Full documentation is available in our developer portal."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "Use the report button on any image or contact our moderation team directly. We take content safety seriously."
    }
  ];

  const resources = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Getting Started Guide",
      description: "Complete walkthrough for new users"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Tutorials",
      description: "Visual guides for all features"
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "API Documentation",
      description: "Technical reference for developers"
    },
    {
      icon: <HelpCircle className="h-6 w-6" />,
      title: "FAQ Database",
      description: "Answers to common questions"
    }
  ];

  return (
    <MainLayout>
      <Helmet>
        <title>Support Center - OpenTeknologies Help</title>
        <meta 
          name="description" 
          content="Get help with OpenTeknologies AI platform. Access documentation, tutorials, live chat, and contact our support team."
        />
        <meta name="keywords" content="support, help, documentation, tutorials, OpenTeknologies, AI, image generation" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
              Support Center
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers, get help, and make the most of our AI image generation platform
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, or guides..."
                className="w-full pl-12 pr-4 py-4 rounded-lg border border-border bg-background text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How Can We Help You?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportOptions.map((option, index) => (
                <Card key={index} className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto p-3 bg-primary/10 rounded-lg text-primary w-fit mb-4">
                      {option.icon}
                    </div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{option.description}</p>
                    <p className="text-sm text-primary mb-4">{option.available}</p>
                    <Button className="w-full">{option.action}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Help Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {resource.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{resource.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Still Need Help?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our support team is standing by to help you with any questions or issues
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/contact'}>
                <Mail className="h-5 w-5 mr-2" />
                Contact Support
              </Button>
              <Button size="lg" variant="outline">
                <MessageSquare className="h-5 w-5 mr-2" />
                Start Live Chat
              </Button>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-muted-foreground">+44 20 7946 0958</p>
                <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM GMT</p>
              </div>
              <div className="text-center">
                <Mail className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-muted-foreground">support@openteknologies.com</p>
                <p className="text-sm text-muted-foreground">24-hour response time</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Support;