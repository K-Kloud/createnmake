
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit2, 
  Share2, 
  Download, 
  Trash2, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar,
  User,
  Settings,
  Save,
  X
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MainLayout } from "@/components/layouts/MainLayout";

const DesignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [editedPublic, setEditedPublic] = useState(false);

  // Fetch design data
  const { data: design, isLoading, error } = useQuery({
    queryKey: ['design', id],
    queryFn: async () => {
      if (!id) throw new Error('Design ID is required');
      
      const { data, error } = await supabase
        .from('generated_images')
        .select(`
          *,
          profiles!generated_images_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Initialize edit state when design loads
  useEffect(() => {
    if (design) {
      setEditedPrompt(design.prompt || "");
      setEditedPublic(design.is_public || false);
    }
  }, [design]);

  // Update design mutation
  const updateDesignMutation = useMutation({
    mutationFn: async (updates: { prompt?: string; is_public?: boolean }) => {
      if (!id) throw new Error('Design ID is required');
      
      const { data, error } = await supabase
        .from('generated_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design', id] });
      queryClient.invalidateQueries({ queryKey: ['user-designs'] });
      setIsEditing(false);
      toast({
        title: "Design updated",
        description: "Your design has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete design mutation
  const deleteDesignMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Design ID is required');
      
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-designs'] });
      toast({
        title: "Design deleted",
        description: "Your design has been deleted successfully.",
      });
      navigate('/designs');
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveChanges = () => {
    updateDesignMutation.mutate({
      prompt: editedPrompt,
      is_public: editedPublic,
    });
  };

  const handleCancelEdit = () => {
    setEditedPrompt(design?.prompt || "");
    setEditedPublic(design?.is_public || false);
    setIsEditing(false);
  };

  const handleShare = async () => {
    if (!design) return;
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Design link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!design?.image_url) return;
    
    const link = document.createElement('a');
    link.href = design.image_url;
    link.download = `design-${design.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your design is being downloaded.",
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !design) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Design Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The design you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/designs')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Designs
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isOwner = user?.id === design.user_id;
  const canEdit = isOwner;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/designs">My Designs</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Design Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/designs')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Designs
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Design Details</h1>
              <p className="text-muted-foreground">
                Created {new Date(design.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            {canEdit && (
              <>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={updateDesignMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <AspectRatio ratio={design.aspect_ratio === 'square' ? 1 : design.aspect_ratio === 'landscape' ? 16/9 : 9/16}>
                  <img
                    src={design.image_url}
                    alt={design.prompt || "Generated design"}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </AspectRatio>
              </CardContent>
            </Card>
          </div>

          {/* Metadata and Controls */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Design Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  {isEditing ? (
                    <Input
                      id="prompt"
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      placeholder="Enter design prompt..."
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {design.prompt || "No prompt provided"}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Aspect Ratio</Label>
                    <p className="font-medium">{design.aspect_ratio || 'square'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="font-medium">
                      {new Date(design.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {canEdit && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label htmlFor="public">Public Design</Label>
                      <Switch
                        id="public"
                        checked={isEditing ? editedPublic : design.is_public}
                        onCheckedChange={setEditedPublic}
                        disabled={!isEditing}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Creator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {design.profiles?.username || 'Anonymous User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isOwner ? 'You' : 'Creator'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delete Option for Owner */}
            {canEdit && (
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Design
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete
                          your design and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteDesignMutation.mutate()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DesignDetail;
