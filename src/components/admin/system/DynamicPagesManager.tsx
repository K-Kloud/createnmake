import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useDynamicPages, DynamicPage } from '@/hooks/useDynamicPages';
import { format } from 'date-fns';

export const DynamicPagesManager = () => {
  const { pages, isLoading, createPage, updatePage, deletePage } = useDynamicPages();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [formData, setFormData] = useState({
    route_path: '',
    page_title: '',
    component_name: '',
    meta_description: '',
    is_active: true,
    requires_auth: false,
    allowed_roles: ['user'] as string[],
    layout_config: {},
  });

  const resetForm = () => {
    setFormData({
      route_path: '',
      page_title: '',
      component_name: '',
      meta_description: '',
      is_active: true,
      requires_auth: false,
      allowed_roles: ['user'],
      layout_config: {},
    });
    setEditingPage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPage) {
      updatePage({ id: editingPage.id, ...formData });
    } else {
      createPage(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (page: DynamicPage) => {
    setEditingPage(page);
    setFormData({
      route_path: page.route_path,
      page_title: page.page_title,
      component_name: page.component_name,
      meta_description: page.meta_description || '',
      is_active: page.is_active,
      requires_auth: page.requires_auth,
      allowed_roles: page.allowed_roles,
      layout_config: page.layout_config,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      deletePage(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dynamic Pages</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="route_path">Route Path</Label>
                    <Input
                      id="route_path"
                      value={formData.route_path}
                      onChange={(e) => setFormData({ ...formData, route_path: e.target.value })}
                      placeholder="/example"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="page_title">Page Title</Label>
                    <Input
                      id="page_title"
                      value={formData.page_title}
                      onChange={(e) => setFormData({ ...formData, page_title: e.target.value })}
                      placeholder="Example Page"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="component_name">Component Name</Label>
                  <Input
                    id="component_name"
                    value={formData.component_name}
                    onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                    placeholder="ExampleComponent"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Page description for SEO"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires_auth"
                      checked={formData.requires_auth}
                      onCheckedChange={(checked) => setFormData({ ...formData, requires_auth: checked })}
                    />
                    <Label htmlFor="requires_auth">Requires Authentication</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPage ? 'Update' : 'Create'} Page
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages?.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-mono">{page.route_path}</TableCell>
                  <TableCell>{page.page_title}</TableCell>
                  <TableCell className="font-mono text-sm">{page.component_name}</TableCell>
                  <TableCell>
                    <Badge variant={page.is_active ? "default" : "secondary"}>
                      {page.is_active ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.requires_auth ? "destructive" : "outline"}>
                      {page.requires_auth ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Required
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3 mr-1" />
                          Public
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(page.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(page)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(page.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};