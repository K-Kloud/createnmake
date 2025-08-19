import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Check, X, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddPortfolioDialog } from "./portfolio/AddPortfolioDialog";
import { PortfolioPreviewDialog } from "./portfolio/PortfolioPreviewDialog";
import { PortfolioItem, PortfolioItemEditData, NewPortfolioItem } from "@/types/admin";
import { log } from "@/lib/logger";

interface PortfolioListProps {
  items: PortfolioItem[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: PortfolioItemEditData) => void;
}

export const PortfolioList = ({ items, onDelete, onUpdate }: PortfolioListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<PortfolioItemEditData>({
    description: '',
    generatedimage: '',
    productimage: ''
  });
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const startEditing = (item: PortfolioItem) => {
    setEditingId(item.id);
    setEditData({
      description: item.description || '',
      generatedimage: item.generatedimage || '',
      productimage: item.productimage || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({
      description: '',
      generatedimage: '',
      productimage: ''
    });
  };

  const handleSaveEdit = (id: number) => {
    onUpdate(id, editData);
    setEditingId(null);
    setEditData({
      description: '',
      generatedimage: '',
      productimage: ''
    });
  };

  const handleAddNew = async (newItem: NewPortfolioItem) => {
    try {
      const { data, error } = await supabase
        .from('manufacturer_portfolios')
        .insert([{
          description: newItem.description,
          generatedimage: newItem.generatedImage,
          productimage: newItem.productImage
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "New portfolio item added successfully",
      });
      setIsAddingNew(false);
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
        <Button onClick={() => setIsAddingNew(true)} className="mb-4">
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
                        onClick={() => handleSaveEdit(item.id)}
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

      <AddPortfolioDialog
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        onAdd={handleAddNew}
      />

      <PortfolioPreviewDialog
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </>
  );
};