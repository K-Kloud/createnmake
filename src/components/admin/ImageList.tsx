import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageListProps {
  images: any[];
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

export const ImageList = ({ images, onDelete, onView }: ImageListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const startEditing = (image: any) => {
    setEditingId(image.id);
    setEditData({
      title: image.title || '',
      prompt: image.prompt || '',
      likes: image.likes || 0,
      views: image.views || 0
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveChanges = async (id: number) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({
          title: editData.title,
          prompt: editData.prompt,
          likes: parseInt(editData.likes),
          views: parseInt(editData.views)
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "The image details have been updated successfully."
      });
      
      setEditingId(null);
      setEditData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Preview</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead>Stats</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {images.map((image) => (
          <TableRow key={image.id}>
            <TableCell>
              <img 
                src={image.image_url} 
                alt={image.title || image.prompt}
                className="w-16 h-16 object-cover rounded"
              />
            </TableCell>
            <TableCell>
              {editingId === image.id ? (
                <div className="space-y-2">
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="Title"
                    className="mb-2"
                  />
                  <Input
                    value={editData.prompt}
                    onChange={(e) => setEditData({ ...editData, prompt: e.target.value })}
                    placeholder="Prompt"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-medium">{image.title || 'Untitled'}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {image.prompt}
                  </div>
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={image.profiles?.avatar_url} />
                  <AvatarFallback>
                    {image.profiles?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span>{image.profiles?.username || 'Anonymous'}</span>
              </div>
            </TableCell>
            <TableCell>
              {editingId === image.id ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span>Likes:</span>
                    <Input
                      type="number"
                      value={editData.likes}
                      onChange={(e) => setEditData({ ...editData, likes: e.target.value })}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Views:</span>
                    <Input
                      type="number"
                      value={editData.views}
                      onChange={(e) => setEditData({ ...editData, views: e.target.value })}
                      className="w-20"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div>Likes: {image.likes || 0}</div>
                  <div>Views: {image.views || 0}</div>
                </div>
              )}
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {editingId === image.id ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => saveChanges(image.id)}
                      className="text-green-500 hover:text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={cancelEditing}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => startEditing(image)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(image.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {images.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              No images found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};