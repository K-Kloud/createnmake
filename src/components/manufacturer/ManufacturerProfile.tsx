import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Save, X, Plus } from "lucide-react";

interface ManufacturerProfileProps {
  manufacturerId: string;
}

export const ManufacturerProfile = ({ manufacturerId }: ManufacturerProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    business_name: "",
    business_type: "",
    address: "",
    phone: "",
    contact_email: "",
    website: "",
    description: "",
    specialties: [] as string[],
  });
  const [newSpecialty, setNewSpecialty] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['manufacturer-profile', manufacturerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('id', manufacturerId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!manufacturerId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: typeof editForm) => {
      const { error } = await supabase
        .from('manufacturers')
        .update({
          business_name: updates.business_name,
          business_type: updates.business_type,
          address: updates.address,
          phone: updates.phone,
          contact_email: updates.contact_email,
          website: updates.website,
          description: updates.description,
          specialties: updates.specialties,
        })
        .eq('id', manufacturerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturer-profile', manufacturerId] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your manufacturer profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });

  const handleEdit = () => {
    if (profile) {
      setEditForm({
        business_name: profile.business_name || "",
        business_type: profile.business_type || "",
        address: profile.address || "",
        phone: profile.phone || "",
        contact_email: profile.contact_email || "",
        website: (profile as any).website || "",
        description: (profile as any).description || "",
        specialties: profile.specialties || [],
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      business_name: "",
      business_type: "",
      address: "",
      phone: "",
      contact_email: "",
      website: "",
      description: "",
      specialties: [],
    });
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !editForm.specialties.includes(newSpecialty.trim())) {
      setEditForm(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setEditForm(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-8">Profile not found</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manufacturer Profile</h2>
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline">
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={updateProfileMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="business_name">Business Name</Label>
            {isEditing ? (
              <Input
                id="business_name"
                value={editForm.business_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="Enter business name"
              />
            ) : (
              <p className="text-sm mt-1">{profile.business_name || "Not specified"}</p>
            )}
          </div>

          <div>
            <Label htmlFor="business_type">Business Type</Label>
            {isEditing ? (
              <Input
                id="business_type"
                value={editForm.business_type}
                onChange={(e) => setEditForm(prev => ({ ...prev, business_type: e.target.value }))}
                placeholder="Enter business type"
              />
            ) : (
              <p className="text-sm mt-1">{profile.business_type || "Not specified"}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            {isEditing ? (
              <Input
                id="contact_email"
                type="email"
                value={editForm.contact_email}
                onChange={(e) => setEditForm(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="Enter contact email"
              />
            ) : (
              <p className="text-sm mt-1">{profile.contact_email || "Not specified"}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            ) : (
              <p className="text-sm mt-1">{profile.phone || "Not specified"}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="website">Website</Label>
            {isEditing ? (
              <Input
                id="website"
                value={editForm.website}
                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                placeholder="Enter website URL"
              />
            ) : (
              <p className="text-sm mt-1">{(profile as any).website || "Not specified"}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter business address"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-1">{profile.address || "Not specified"}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your manufacturing business"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-1">{(profile as any).description || "Not specified"}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Label>Specialties</Label>
        {isEditing ? (
          <div className="space-y-3 mt-2">
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Add a specialty"
                onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
              />
              <Button onClick={addSpecialty} type="button" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editForm.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                  {specialty}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeSpecialty(specialty)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.specialties?.map((specialty: string) => (
              <Badge key={specialty} variant="secondary">
                {specialty}
              </Badge>
            )) || <span className="text-sm text-muted-foreground">No specialties added</span>}
          </div>
        )}
      </div>
    </Card>
  );
};