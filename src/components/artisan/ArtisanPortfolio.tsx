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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Upload, Star, Eye, EyeOff, Edit3, Trash2, Calendar, DollarSign } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_type: string;
  materials_used: string[];
  completion_date: string;
  client_name: string;
  project_value: number;
  display_order: number;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
}

export const ArtisanPortfolio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newMaterial, setNewMaterial] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    project_type: "",
    materials_used: [] as string[],
    completion_date: "",
    client_name: "",
    project_value: 0,
    is_featured: false,
    is_public: true,
  });

  // Fetch portfolio items
  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ['artisan-portfolio', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('artisan_portfolio')
        .select('*')
        .eq('artisan_id', user.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as PortfolioItem[];
    },
    enabled: !!user?.id,
  });

  // Add portfolio item mutation
  const addPortfolioItem = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('artisan_portfolio')
        .insert({
          artisan_id: user.id,
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          project_type: data.project_type,
          materials_used: data.materials_used,
          completion_date: data.completion_date,
          client_name: data.client_name,
          project_value: data.project_value,
          is_featured: data.is_featured,
          is_public: data.is_public,
          display_order: (portfolioItems?.length || 0) + 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisan-portfolio'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: "Portfolio Item Added",
        description: "Your portfolio item has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Item",
        description: "Could not add portfolio item. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update portfolio item mutation
  const updatePortfolioItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PortfolioItem> }) => {
      const { error } = await supabase
        .from('artisan_portfolio')
        .update(data)
        .eq('id', id)
        .eq('artisan_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisan-portfolio'] });
      toast({
        title: "Portfolio Updated",
        description: "Portfolio item updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update portfolio item",
        variant: "destructive",
      });
    }
  });

  // Delete portfolio item mutation
  const deletePortfolioItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('artisan_portfolio')
        .delete()
        .eq('id', id)
        .eq('artisan_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisan-portfolio'] });
      toast({
        title: "Item Deleted",
        description: "Portfolio item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete portfolio item",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      project_type: "",
      materials_used: [],
      completion_date: "",
      client_name: "",
      project_value: 0,
      is_featured: false,
      is_public: true,
    });
    setEditingItem(null);
  };

  const handleEdit = (item: PortfolioItem) => {
    setFormData({
      title: item.title,
      description: item.description || "",
      image_url: item.image_url,
      project_type: item.project_type || "",
      materials_used: item.materials_used || [],
      completion_date: item.completion_date || "",
      client_name: item.client_name || "",
      project_value: item.project_value || 0,
      is_featured: item.is_featured,
      is_public: item.is_public,
    });
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updatePortfolioItem.mutate({ id: editingItem.id, data: formData });
    } else {
      addPortfolioItem.mutate(formData);
    }
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !formData.materials_used.includes(newMaterial.trim())) {
      setFormData({
        ...formData,
        materials_used: [...formData.materials_used, newMaterial.trim()]
      });
      setNewMaterial("");
    }
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials_used: formData.materials_used.filter((_, i) => i !== index)
    });
  };

  const toggleFeatured = (item: PortfolioItem) => {
    updatePortfolioItem.mutate({
      id: item.id,
      data: { is_featured: !item.is_featured }
    });
  };

  const togglePublic = (item: PortfolioItem) => {
    updatePortfolioItem.mutate({
      id: item.id,
      data: { is_public: !item.is_public }
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
          <h2 className="text-2xl font-bold">Portfolio</h2>
          <p className="text-muted-foreground">Showcase your best work to potential clients</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Update your portfolio item details" : "Add a new item to showcase your work"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Project title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_type">Project Type</Label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(value) => setFormData({ ...formData, project_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="jewelry">Jewelry</SelectItem>
                      <SelectItem value="ceramics">Ceramics</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                      <SelectItem value="woodwork">Woodwork</SelectItem>
                      <SelectItem value="metalwork">Metalwork</SelectItem>
                      <SelectItem value="leatherwork">Leatherwork</SelectItem>
                      <SelectItem value="glasswork">Glasswork</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_value">Project Value (£)</Label>
                  <Input
                    id="project_value"
                    type="number"
                    value={formData.project_value}
                    onChange={(e) => setFormData({ ...formData, project_value: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL *</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the project, your process, and what makes it special..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Client or company name (optional)"
                />
              </div>

              {/* Materials */}
              <div className="space-y-2">
                <Label>Materials Used</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.materials_used.map((material, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {material}
                      <button type="button" onClick={() => removeMaterial(index)} className="ml-1 text-xs">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder="Add material"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                  />
                  <Button type="button" onClick={addMaterial} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Switches */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured Item</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                  <Label htmlFor="is_public">Public</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addPortfolioItem.isPending || updatePortfolioItem.isPending}>
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Grid */}
      {portfolioItems && portfolioItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.is_featured && (
                    <Badge variant="default" className="bg-yellow-500">
                      <Star className="w-3 h-3" />
                    </Badge>
                  )}
                  {!item.is_public && (
                    <Badge variant="secondary">
                      <EyeOff className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {item.project_type && (
                      <CardDescription className="capitalize">{item.project_type}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(item)}
                      className="p-1 h-auto"
                    >
                      <Star className={`w-4 h-4 ${item.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublic(item)}
                      className="p-1 h-auto"
                    >
                      {item.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="p-1 h-auto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePortfolioItem.mutate(item.id)}
                      className="p-1 h-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                {/* Materials */}
                {item.materials_used && item.materials_used.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {item.materials_used.slice(0, 3).map((material, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                      {item.materials_used.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.materials_used.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Project Details */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {item.completion_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.completion_date).toLocaleDateString()}
                    </div>
                  )}
                  {item.project_value > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      £{item.project_value.toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Portfolio Items Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your portfolio by adding your best work. Showcase your skills and attract more clients.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};