import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  project_type: string;
  completion_date: string;
  client_name: string;
  materials_used: string[];
  project_value: number;
  display_order: number;
  is_featured: boolean;
}

interface ManufacturerPortfolioProps {
  manufacturerId: string;
}

export const ManufacturerPortfolio = ({ manufacturerId }: ManufacturerPortfolioProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    project_type: "",
    completion_date: "",
    client_name: "",
    materials_used: [] as string[],
    project_value: "",
    is_featured: false,
  });
  const [newMaterial, setNewMaterial] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ['manufacturer-portfolio', manufacturerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturer_portfolios')
        .select('*')
        .eq('manufacturer_id', manufacturerId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data?.map((item: any) => ({
        id: item.id,
        title: item.title || "Untitled Project",
        description: item.description || "",
        image_url: item.generatedimage || item.productimage || "",
        project_type: item.project_type || "",
        completion_date: item.completion_date || "",
        client_name: item.client_name || "",
        materials_used: item.materials_used || [],
        project_value: item.project_value || 0,
        display_order: item.display_order || 0,
        is_featured: item.is_featured || false,
      })) || [];
    },
    enabled: !!manufacturerId,
  });

  const createItemMutation = useMutation({
    mutationFn: async (itemData: typeof formData) => {
      const { error } = await supabase
        .from('manufacturer_portfolios')
        .insert({
          manufacturer_id: manufacturerId,
          title: itemData.title,
          description: itemData.description,
          image_url: itemData.image_url,
          project_type: itemData.project_type,
          completion_date: itemData.completion_date || null,
          client_name: itemData.client_name,
          materials_used: itemData.materials_used,
          project_value: itemData.project_value ? parseFloat(itemData.project_value) : null,
          is_featured: itemData.is_featured,
          display_order: (portfolioItems?.length || 0) + 1,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturer-portfolio', manufacturerId] });
      resetForm();
      setIsDialogOpen(false);
      toast({
        title: "Portfolio item added",
        description: "Your portfolio item has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add portfolio item. Please try again.",
        variant: "destructive",
      });
      console.error("Portfolio creation error:", error);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, itemData }: { id: number; itemData: typeof formData }) => {
      const { error } = await supabase
        .from('manufacturer_portfolios')
        .update({
          title: itemData.title,
          description: itemData.description,
          image_url: itemData.image_url,
          project_type: itemData.project_type,
          completion_date: itemData.completion_date || null,
          client_name: itemData.client_name,
          materials_used: itemData.materials_used,
          project_value: itemData.project_value ? parseFloat(itemData.project_value) : null,
          is_featured: itemData.is_featured,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturer-portfolio', manufacturerId] });
      resetForm();
      setEditingItem(null);
      setIsDialogOpen(false);
      toast({
        title: "Portfolio item updated",
        description: "Your portfolio item has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update portfolio item. Please try again.",
        variant: "destructive",
      });
      console.error("Portfolio update error:", error);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('manufacturer_portfolios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturer-portfolio', manufacturerId] });
      toast({
        title: "Portfolio item deleted",
        description: "Your portfolio item has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete portfolio item. Please try again.",
        variant: "destructive",
      });
      console.error("Portfolio deletion error:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      project_type: "",
      completion_date: "",
      client_name: "",
      materials_used: [],
      project_value: "",
      is_featured: false,
    });
    setNewMaterial("");
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      project_type: item.project_type,
      completion_date: item.completion_date,
      client_name: item.client_name,
      materials_used: item.materials_used || [],
      project_value: item.project_value?.toString() || "",
      is_featured: item.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, itemData: formData });
    } else {
      createItemMutation.mutate(formData);
    }
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !formData.materials_used.includes(newMaterial.trim())) {
      setFormData(prev => ({
        ...prev,
        materials_used: [...prev.materials_used, newMaterial.trim()]
      }));
      setNewMaterial("");
    }
  };

  const removeMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materials_used: prev.materials_used.filter(m => m !== material)
    }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading portfolio...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Portfolio</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingItem(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project_type">Project Type</Label>
                  <Input
                    id="project_type"
                    value={formData.project_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL *</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="project_value">Project Value (£)</Label>
                <Input
                  id="project_value"
                  type="number"
                  step="0.01"
                  value={formData.project_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_value: e.target.value }))}
                />
              </div>

              <div>
                <Label>Materials Used</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <Input
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      placeholder="Add a material"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                    />
                    <Button onClick={addMaterial} type="button" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.materials_used.map((material) => (
                      <span key={material} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        {material}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeMaterial(material)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                />
                <Label htmlFor="is_featured">Featured item</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                >
                  {editingItem ? "Update" : "Add"} Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems?.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video bg-muted">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{item.title}</h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {item.project_type && (
                <p className="text-sm text-muted-foreground mb-2">{item.project_type}</p>
              )}
              <p className="text-sm mb-3">{item.description}</p>
              {item.client_name && (
                <p className="text-xs text-muted-foreground">Client: {item.client_name}</p>
              )}
              {item.project_value && (
                <p className="text-xs text-muted-foreground">Value: £{item.project_value.toLocaleString()}</p>
              )}
              {item.is_featured && (
                <span className="inline-block bg-primary text-primary-foreground px-2 py-1 rounded text-xs mt-2">
                  Featured
                </span>
              )}
            </div>
          </Card>
        )) || (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No portfolio items yet. Add your first project to showcase your work.
          </div>
        )}
      </div>
    </div>
  );
};