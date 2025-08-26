import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Camera, MapPin, Clock, Star, Award, Plus, X } from "lucide-react";
import { ArtisanPortfolio } from "./ArtisanPortfolio";

interface ArtisanProfileData {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string;
  specialties: string[];
  years_experience: number;
  hourly_rate: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  working_hours: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  skills: string[];
  certifications: string[];
  preferred_project_types: string[];
  minimum_project_value: number;
  response_time_hours: number;
}

const DEFAULT_WORKING_HOURS = {
  monday: { start: "09:00", end: "17:00", available: true },
  tuesday: { start: "09:00", end: "17:00", available: true },
  wednesday: { start: "09:00", end: "17:00", available: true },
  thursday: { start: "09:00", end: "17:00", available: true },
  friday: { start: "09:00", end: "17:00", available: true },
  saturday: { start: "10:00", end: "16:00", available: false },
  sunday: { start: "10:00", end: "16:00", available: false },
};

export const ArtisanProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCertification, setNewCertification] = useState("");

  // Fetch artisan profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['artisan-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        display_name: data.display_name || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        avatar_url: data.avatar_url || '',
        specialties: data.specialties || [],
        years_experience: data.years_experience || 0,
        hourly_rate: data.hourly_rate || 0,
        availability_status: data.availability_status || 'available',
        working_hours: data.working_hours || DEFAULT_WORKING_HOURS,
        skills: data.skills || [],
        certifications: data.certifications || [],
        preferred_project_types: data.preferred_project_types || [],
        minimum_project_value: data.minimum_project_value || 0,
        response_time_hours: data.response_time_hours || 24,
      } as ArtisanProfileData;
    },
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState<Partial<ArtisanProfileData>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: Partial<ArtisanProfileData>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          bio: data.bio,
          location: data.location,
          website: data.website,
          specialties: data.specialties,
          years_experience: data.years_experience,
          hourly_rate: data.hourly_rate,
          availability_status: data.availability_status,
          working_hours: data.working_hours,
          skills: data.skills,
          certifications: data.certifications,
          preferred_project_types: data.preferred_project_types,
          minimum_project_value: data.minimum_project_value,
          response_time_hours: data.response_time_hours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisan-profile'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your artisan profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const addSkill = () => {
    if (newSkill.trim() && formData.skills) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    if (formData.skills) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((_, i) => i !== index)
      });
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && formData.specialties) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index: number) => {
    if (formData.specialties) {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter((_, i) => i !== index)
      });
    }
  };

  const addCertification = () => {
    if (newCertification.trim() && formData.certifications) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()]
      });
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    if (formData.certifications) {
      setFormData({
        ...formData,
        certifications: formData.certifications.filter((_, i) => i !== index)
      });
    }
  };

  const updateWorkingHours = (day: string, field: 'start' | 'end' | 'available', value: string | boolean) => {
    setFormData({
      ...formData,
      working_hours: {
        ...formData.working_hours!,
        [day]: {
          ...formData.working_hours![day as keyof typeof formData.working_hours],
          [field]: value
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Artisan Profile</h1>
          <p className="text-muted-foreground">Manage your professional profile and portfolio</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback>{formData.display_name?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name || ''}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://your-website.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      value={formData.years_experience || 0}
                      onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell potential clients about yourself, your experience, and your approach to work..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Professional Details
                </CardTitle>
                <CardDescription>Your rates, specialties, and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={formData.hourly_rate || 0}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                      disabled={!isEditing}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimum_project_value">Minimum Project Value (£)</Label>
                    <Input
                      id="minimum_project_value"
                      type="number"
                      value={formData.minimum_project_value || 0}
                      onChange={(e) => setFormData({ ...formData, minimum_project_value: parseFloat(e.target.value) || 0 })}
                      disabled={!isEditing}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="response_time_hours">Response Time (hours)</Label>
                    <Input
                      id="response_time_hours"
                      type="number"
                      value={formData.response_time_hours || 24}
                      onChange={(e) => setFormData({ ...formData, response_time_hours: parseInt(e.target.value) || 24 })}
                      disabled={!isEditing}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability_status">Availability Status</Label>
                    <Select
                      value={formData.availability_status || 'available'}
                      onValueChange={(value) => setFormData({ ...formData, availability_status: value as any })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        {isEditing && (
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(index)} />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.specialties?.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {specialty}
                        {isEditing && (
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeSpecialty(index)} />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Add a specialty"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                      />
                      <Button type="button" onClick={addSpecialty} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.certifications?.map((cert, index) => (
                      <Badge key={index} variant="default" className="flex items-center gap-1">
                        {cert}
                        {isEditing && (
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeCertification(index)} />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Add a certification"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                      />
                      <Button type="button" onClick={addCertification} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
            )}
          </form>
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Working Hours
              </CardTitle>
              <CardDescription>Set your availability throughout the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(formData.working_hours || DEFAULT_WORKING_HOURS).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24 font-medium capitalize">{day}</div>
                  <Switch
                    checked={hours.available}
                    onCheckedChange={(checked) => updateWorkingHours(day, 'available', checked)}
                    disabled={!isEditing}
                  />
                  {hours.available && (
                    <>
                      <Input
                        type="time"
                        value={hours.start}
                        onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                        disabled={!isEditing}
                        className="w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={hours.end}
                        onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                        disabled={!isEditing}
                        className="w-32"
                      />
                    </>
                  )}
                  {!hours.available && (
                    <span className="text-muted-foreground">Not available</span>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <Button onClick={() => updateProfile.mutate(formData)} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save Availability"}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <ArtisanPortfolio />
        </TabsContent>
      </Tabs>
    </div>
  );
};