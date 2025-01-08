import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadField } from "@/components/admin/portfolio/ImageUploadField";
import { supabase } from "@/integrations/supabase/client";

const BUSINESS_TYPES = [
  "Leather Worker",
  "Shoemaker",
  "Furniture Maker",
  "Jeweler",
  "Textile Artist",
  "Woodworker",
  "Metalworker",
  "Ceramicist",
  "Glass Artist",
  "Custom Tailor"
];

export const ArtisanOnboardingForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    specialties: "",
    phone: "",
    address: "",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Update the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          business_name: formData.businessName,
          business_type: formData.businessType,
          specialties: formData.specialties.split(",").map(s => s.trim()),
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          is_artisan: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your artisan profile has been created successfully.",
      });

      navigate("/artisan");
    } catch (error) {
      console.error("Submission error:", error);
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
      <div className="flex flex-col items-center mb-6 space-y-4">
        <ImageUploadField
          label="Profile Picture"
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
        <Select
          value={formData.businessType}
          onValueChange={(value) => setFormData({ ...formData, businessType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your business type" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialties">Specialties (comma-separated)</Label>
        <Input
          id="specialties"
          value={formData.specialties}
          onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
          placeholder="e.g. Custom shoes, Leather bags, Repairs"
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
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about your craft and experience..."
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Profile..." : "Complete Profile"}
      </Button>
    </form>
  );
};