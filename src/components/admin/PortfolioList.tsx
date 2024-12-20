import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PortfolioListProps {
  items: any[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: any) => void;
}

export const PortfolioList = ({ items, onDelete, onUpdate }: PortfolioListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [previewItem, setPreviewItem] = useState<any>(null);

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditData({
      description: item.description || '',
      generatedImage: item.generatedImage || '',
      productImage: item.productImage || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleUpdate = async (id: number) => {
    try {
      await onUpdate(id, editData);
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update portfolio item",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Generated Design</TableHead>
            <TableHead>Made Product</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <img
                  src={item.generatedImage}
                  alt="Generated design"
                  className="w-16 h-16 object-cover rounded"
                  onClick={() => setPreviewItem(item)}
                />
              </TableCell>
              <TableCell>
                <img
                  src={item.productImage}
                  alt="Made product"
                  className="w-16 h-16 object-cover rounded"
                  onClick={() => setPreviewItem(item)}
                />
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full"
                  />
                ) : (
                  <span>{item.description}</span>
                )}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {editingId === item.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdate(item.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startEditing(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(item.id)}
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
        </TableBody>
      </Table>

      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Portfolio Item Preview</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Generated Design</h3>
                <img
                  src={previewItem.generatedImage}
                  alt="Generated design"
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Made Product</h3>
                <img
                  src={previewItem.productImage}
                  alt="Made product"
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">{previewItem.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};