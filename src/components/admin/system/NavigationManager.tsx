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
import { Plus, Edit, Trash2, Navigation, ExternalLink, Lock, Unlock, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigation, NavigationItem } from '@/hooks/useNavigation';
import { format } from 'date-fns';

export const NavigationManager = () => {
  const { navigationItems, isLoading, createNavigationItem, updateNavigationItem, deleteNavigationItem } = useNavigation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    label: '',
    path: '',
    icon: '',
    order: 1,
    is_active: true,
    requires_auth: false,
    allowed_roles: ['user'] as string[],
    is_external: false,
    target: '_self' as '_blank' | '_self',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      label: '',
      path: '',
      icon: '',
      order: Math.max(...navigationItems.map(item => item.order), 0) + 1,
      is_active: true,
      requires_auth: false,
      allowed_roles: ['user'],
      is_external: false,
      target: '_self',
      description: '',
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      updateNavigationItem({ id: editingItem.id, ...formData });
    } else {
      createNavigationItem(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      path: item.path,
      icon: item.icon || '',
      order: item.order,
      is_active: item.is_active,
      requires_auth: item.requires_auth,
      allowed_roles: item.allowed_roles,
      is_external: item.is_external,
      target: item.target || '_self',
      description: item.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this navigation item?')) {
      deleteNavigationItem(id);
    }
  };

  const handleMoveUp = (item: NavigationItem) => {
    const currentIndex = navigationItems.findIndex(nav => nav.id === item.id);
    if (currentIndex > 0) {
      const newOrder = navigationItems[currentIndex - 1].order;
      updateNavigationItem({ id: item.id, order: newOrder - 0.5 });
    }
  };

  const handleMoveDown = (item: NavigationItem) => {
    const currentIndex = navigationItems.findIndex(nav => nav.id === item.id);
    if (currentIndex < navigationItems.length - 1) {
      const newOrder = navigationItems[currentIndex + 1].order;
      updateNavigationItem({ id: item.id, order: newOrder + 0.5 });
    }
  };

  const filteredItems = navigationItems?.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Navigation Manager</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Navigation Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Navigation Item' : 'Create New Navigation Item'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Dashboard"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="path">Path</Label>
                    <Input
                      id="path"
                      value={formData.path}
                      onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                      placeholder="/dashboard or https://example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon (Lucide name)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="Home, Package, Shield"
                    />
                  </div>
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for this navigation item"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_external"
                      checked={formData.is_external}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_external: checked })}
                    />
                    <Label htmlFor="is_external">External Link</Label>
                  </div>
                  {formData.is_external && (
                    <div>
                      <Label htmlFor="target">Target</Label>
                      <Select value={formData.target} onValueChange={(value: any) => setFormData({ ...formData, target: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_self">Same Tab</SelectItem>
                          <SelectItem value="_blank">New Tab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update' : 'Create'} Navigation Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search navigation items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono text-sm">{item.order}</span>
                      <div className="flex flex-col">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={() => handleMoveUp(item)}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={() => handleMoveDown(item)}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      {item.label}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-1">
                      {item.is_external && <ExternalLink className="h-3 w-3" />}
                      {item.path}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.requires_auth ? "destructive" : "outline"}>
                      {item.requires_auth ? (
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
                  <TableCell>
                    <Badge variant={item.is_external ? "secondary" : "outline"}>
                      {item.is_external ? 'External' : 'Internal'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(item.updated_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
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