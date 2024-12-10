import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Database, List, Edit, Trash, Plus, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

interface Page {
  id: number;
  page_name: string;
  page_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({ page_name: "", page_url: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ['adminPages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adminpages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add new page
  const addPageMutation = useMutation({
    mutationFn: async (newPage: { page_name: string; page_url: string }) => {
      const { data, error } = await supabase
        .from('adminpages')
        .insert([newPage])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPages'] });
      setIsAddDialogOpen(false);
      setNewPage({ page_name: "", page_url: "" });
      toast({
        title: "Success",
        description: "Page added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add page: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete page
  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('adminpages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPages'] });
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete page: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle page status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { error } = await supabase
        .from('adminpages')
        .update({ is_active: !is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPages'] });
      toast({
        title: "Success",
        description: "Page status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update page status: " + error.message,
        variant: "destructive",
      });
    }
  });

  const filteredPages = pages?.filter(page => 
    page.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.page_url.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Page Management</h1>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add New Page
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            View All
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : filteredPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No pages found</TableCell>
                </TableRow>
              ) : (
                filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.page_name}</TableCell>
                    <TableCell>{page.page_url}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        className={`px-2 py-1 rounded-full text-xs ${
                          page.is_active 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        }`}
                        onClick={() => toggleStatusMutation.mutate({ id: page.id, is_active: page.is_active })}
                      >
                        {page.is_active ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                    <TableCell>{new Date(page.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => deletePageMutation.mutate(page.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      <Footer />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="page_name">Page Name</Label>
              <Input
                id="page_name"
                value={newPage.page_name}
                onChange={(e) => setNewPage({ ...newPage, page_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="page_url">Page URL</Label>
              <Input
                id="page_url"
                value={newPage.page_url}
                onChange={(e) => setNewPage({ ...newPage, page_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => addPageMutation.mutate(newPage)}
              disabled={!newPage.page_name || !newPage.page_url}
            >
              Add Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;