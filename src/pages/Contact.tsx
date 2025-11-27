
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useContactForm } from "@/hooks/useContactForm";

const Contact = () => {
  const phoneNumber = "+44 7438306305";
  const whatsappLink = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;
  const { formData, handleInputChange, handleSubmit, isSubmitting } = useContactForm();

  return (
    <MainLayout
      seo={{
        title: "Contact Us | Get in Touch",
        description: "Have a question or need assistance? Get in touch with our team today."
      }}
    >
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              
              <div className="mb-4 p-3 bg-[hsl(var(--acid-lime))]/10 border border-[hsl(var(--acid-lime))]/20 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--acid-lime))] animate-pulse" />
                  <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--acid-lime))]">
                    Response Time Estimate
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">General Inquiries:</span> 24-48 hours
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Technical Support:</span> 2-4 hours
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Order Issues:</span> 1-2 hours
                </p>
              </div>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Input 
                    placeholder="Your Name" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input 
                    type="email" 
                    placeholder="Your Email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input 
                    placeholder="Subject" 
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Textarea 
                    placeholder="Your Message" 
                    className="min-h-[150px]" 
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-400">support@openteknologies.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-gray-400">{phoneNumber}</p>
                    </div>
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

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gray-400">123 AI Street, Tech City</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
