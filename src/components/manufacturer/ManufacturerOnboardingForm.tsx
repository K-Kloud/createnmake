import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessTypeSelect } from "@/components/ui/business-type-select";
import { ImageUploadField } from "@/components/admin/portfolio/ImageUploadField";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ManufacturerOnboardingForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    contactEmail: "",
    phone: "",
    address: "",
    specialties: "",
    bio: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create a new user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.contactEmail,
        password: Math.random().toString(36).slice(-8), // Generate a random password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user created");

      // Update profile with avatar
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          business_name: formData.businessName,
          business_type: formData.businessType,
          phone: formData.phone,
          address: formData.address,
          specialties: formData.specialties.split(",").map(s => s.trim()),
          bio: formData.bio
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // Create manufacturer record
      const { error: manufacturerError } = await supabase
        .from("manufacturers")
        .insert({
          id: authData.user.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          contact_email: formData.contactEmail,
          phone: formData.phone,
          address: formData.address,
          specialties: formData.specialties.split(",").map(s => s.trim()),
        });

      if (manufacturerError) throw manufacturerError;

      toast({
        title: "Success",
        description: "Manufacturer account created successfully. A confirmation email has been sent.",
      });

      // Reset form
      setFormData({
        businessName: "",
        businessType: "",
        contactEmail: "",
        phone: "",
        address: "",
        specialties: "",
        bio: ""
      });
      setAvatarUrl("");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <ImageUploadField
          label=""
          id="avatar"
          onChange={setAvatarUrl}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type</Label>
        <BusinessTypeSelect
          value={formData.businessType}
          onChange={(value) => setFormData({ ...formData, businessType: value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Business Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialties">Specialties (comma-separated)</Label>
        <Input
          id="specialties"
          value={formData.specialties}
          onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
          placeholder="e.g. Custom furniture, Wood carving, Metal work"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Business Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about your business..."
          className="h-32"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Manufacturer Account"
        )}
      </Button>
    </form>
  );
};