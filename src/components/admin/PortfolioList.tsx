import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Check, X, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PortfolioListProps {
  items: any[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: any) => void;
}

export const PortfolioList = ({ items, onDelete, onUpdate }: PortfolioListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState({
    description: '',
    generatedImage: '',
    productImage: ''
  });

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditData({
      description: item.description || '',
      generatedImage: item.generatedimage || '',
      productImage: item.productimage || ''
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

  const handleAddNew = async () => {
    try {
      const { data, error } = await supabase
        .from('manufacturer_portfolios')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "New portfolio item added successfully",
      });
      setIsAddingNew(false);
      setNewItem({
        description: '',
        generatedImage: '',
        productImage: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new portfolio item",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="p-4">
        <Button 
          onClick={() => setIsAddingNew(true)}
          className="mb-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Portfolio Item
        </Button>
      </div>

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
                  src={item.generatedimage}
                  alt="Generated design"
                  className="w-16 h-16 object-cover rounded cursor-pointer"
                  onClick={() => setPreviewItem(item)}
                />
              </TableCell>
              <TableCell>
                <img
                  src={item.productimage}
                  alt="Made product"
                  className="w-16 h-16 object-cover rounded cursor-pointer"
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
                  src={previewItem.generatedimage}
                  alt="Generated design"
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Made Product</h3>
                <img
                  src={previewItem.productimage}
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

      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Portfolio Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="generatedImage">Generated Design Image URL</Label>
              <Input
                id="generatedImage"
                value={newItem.generatedImage}
                onChange={(e) => setNewItem({ ...newItem, generatedImage: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="productImage">Made Product Image URL</Label>
              <Input
                id="productImage"
                value={newItem.productImage}
                onChange={(e) => setNewItem({ ...newItem, productImage: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>Cancel</Button>
            <Button onClick={handleAddNew}>Add Portfolio Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};