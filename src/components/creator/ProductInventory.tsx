
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductInventoryProps {
  creatorId: string;
}

export const ProductInventory = ({ creatorId }: ProductInventoryProps) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    inventory: "1",
    category: ""
  });

  const { data: products, refetch } = useQuery({
    queryKey: ['creator-products', creatorId],
    queryFn: async () => {
      const { data } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', creatorId)
        .eq('is_public', true);
      return data || [];
    },
  });

  const handleAddProduct = async () => {
    try {
      // This would typically update or create a product in the database
      toast({
        title: "Product Added",
        description: "Your product has been added to inventory.",
      });
      setIsAddDialogOpen(false);
      setNewProduct({
        title: "",
        price: "",
        inventory: "1",
        category: ""
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePriceChange = (productId: number, newPrice: string) => {
    // Update price in database
    supabase
      .from('generated_images')
      .update({ price: newPrice })
      .eq('id', productId)
      .then(() => {
        toast({
          title: "Price Updated",
          description: "Product price has been updated successfully.",
        });
        refetch();
      })
      .catch(error => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Inventory</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title">Product Name</label>
                <Input
                  id="title"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="price">Price (£)</label>
                <Input
                  id="price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="inventory">Available Inventory</label>
                <Input
                  id="inventory"
                  type="number"
                  value={newProduct.inventory}
                  onChange={(e) => setNewProduct({ ...newProduct, inventory: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category">Category</label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full mt-4">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.length ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title || product.prompt.substring(0, 20)}</TableCell>
                  <TableCell>
                    <Input
                      className="w-20 h-8"
                      defaultValue={product.price || ""}
                      onBlur={(e) => handlePriceChange(product.id, e.target.value)}
                    />
                  </TableCell>
                  <TableCell>{product.status || "Available"}</TableCell>
                  <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
