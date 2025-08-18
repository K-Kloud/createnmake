import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useContactForm } from "@/hooks/useContactForm";
import { Send, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const priorityLevels = [
  { value: "low", label: "Low Priority", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High Priority", color: "bg-red-100 text-red-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-200 text-red-900" }
];

const inquiryTypes = [
  "General Inquiry",
  "Technical Support",
  "Sales Question",
  "Feature Request",
  "Bug Report",
  "Partnership",
  "Other"
];

export const EnhancedContactForm = () => {
  const { formData, handleInputChange, handleSubmit, isSubmitting } = useContactForm();
  const [priority, setPriority] = useState("medium");
  const [inquiryType, setInquiryType] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inquiryType) {
      toast({
        title: "Please select an inquiry type",
        variant: "destructive",
      });
      return;
    }

    // Enhanced form data with priority and type
    const enhancedData = {
      ...formData,
      priority,
      inquiry_type: inquiryType,
      attachments: attachments.length
    };

    await handleSubmit(e);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files].slice(0, 3)); // Max 3 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const selectedPriority = priorityLevels.find(p => p.value === priority);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Contact Us
        </CardTitle>
        <CardDescription>
          Send us a message and we'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="inquiry-type" className="text-sm font-medium">
                Inquiry Type *
              </label>
              <Select value={inquiryType} onValueChange={setInquiryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inquiry type" />
                </SelectTrigger>
                <SelectContent>
                  {inquiryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority Level
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={level.color}>
                          {level.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject *
            </label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Brief description of your inquiry"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message *
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Please provide detailed information about your inquiry..."
              className="min-h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="attachments" className="text-sm font-medium">
              Attachments (Optional)
            </label>
            <Input
              id="attachments"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
            />
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((file, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeAttachment(index)}
                  >
                    {file.name} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedPriority && (
                <Badge className={selectedPriority.color}>
                  {selectedPriority.label}
                </Badge>
              )}
              {inquiryType && (
                <Badge variant="outline">
                  {inquiryType}
                </Badge>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};