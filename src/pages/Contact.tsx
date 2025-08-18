
import { MainLayout } from "@/components/layouts/MainLayout";
import { EnhancedContactForm } from "@/components/contact/EnhancedContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, MessageSquare, Headphones, MessageCircle } from "lucide-react";

const Contact = () => {
  const phoneNumber = "+44 7438306305";
  const whatsappLink = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;

  return (
    <MainLayout
      seo={{
        title: "Contact Us | Get in Touch",
        description: "Contact our team for support, questions, or feedback. We're here to help you succeed."
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions or need support? We're here to help. Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Send us an email anytime</p>
                  <p className="font-medium">support@openteknologies.com</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Response time: Within 2-4 hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground mb-2">Talk to our team directly</p>
                      <p className="font-medium">{phoneNumber}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Mon-Fri: 9am - 6pm GMT
                      </p>
                    </div>
                    <a 
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Chat with us in real-time</p>
                  <p className="font-medium">Available 24/7</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the chat bubble in the bottom right
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Office Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Visit us in person</p>
                  <p className="font-medium">
                    123 AI Street<br />
                    Tech City, UK
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Mon-Fri: 9am - 5pm GMT
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="h-5 w-5" />
                    Priority Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Enterprise customers</p>
                  <p className="font-medium">priority@openteknologies.com</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Dedicated support team with 1-hour response time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Contact Form */}
            <div className="lg:col-span-2">
              <EnhancedContactForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
