
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploadField } from "@/components/admin/portfolio/ImageUploadField";
import { Icons } from "@/components/Icons";

export const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    category: "",
    socialLinks: "",
    paymentInfo: "",
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
          username: formData.displayName,
          bio: formData.bio,
          is_creator: true,
          creator_category: formData.category,
          social_links: formData.socialLinks.split(',').map(s => s.trim()),
          payment_info: formData.paymentInfo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your creator profile has been created successfully.",
      });

      navigate("/creator/dashboard");
    } catch (error: any) {
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
    <Card className="max-w-2xl mx-auto glass-card">
      <CardHeader>
        <CardTitle>Create Your Creator Profile</CardTitle>
        <CardDescription>
          Set up your profile to start selling your designs in the marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6 space-y-4">
            <ImageUploadField
              label="Profile Picture"
              id="avatar"
              onChange={setAvatarUrl}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Primary Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Furniture, Fashion, Decor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell potential customers about yourself and your design style..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialLinks">Social Media Links (comma-separated)</Label>
            <Input
              id="socialLinks"
              value={formData.socialLinks}
              onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
              placeholder="e.g. instagram.com/myhandle, twitter.com/myhandle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentInfo">Payment Information</Label>
            <Textarea
              id="paymentInfo"
              value={formData.paymentInfo}
              onChange={(e) => setFormData({ ...formData, paymentInfo: e.target.value })}
              placeholder="Enter your preferred payment method details (this will be encrypted)"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Complete Creator Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
