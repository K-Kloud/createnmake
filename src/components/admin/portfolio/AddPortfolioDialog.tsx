import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ImageUploadField } from "./ImageUploadField";

interface AddPortfolioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export const AddPortfolioDialog = ({ isOpen, onClose, onAdd }: AddPortfolioDialogProps) => {
  const [newItem, setNewItem] = useState({
    description: '',
    generatedImage: '',
    productImage: ''
  });

  const handleAdd = () => {
    onAdd(newItem);
    setNewItem({
      description: '',
      generatedImage: '',
      productImage: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Portfolio Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ImageUploadField
            label="Generated Design Image"
            id="generatedImage"
            onChange={(url) => setNewItem({ ...newItem, generatedImage: url })}
          />
          <ImageUploadField
            label="Made Product Image"
            id="productImage"
            onChange={(url) => setNewItem({ ...newItem, productImage: url })}
          />
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd}>Add Portfolio Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};