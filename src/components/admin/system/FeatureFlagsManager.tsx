import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Flag, FlagOff } from 'lucide-react';
import { useFeatureFlags, FeatureFlag } from '@/hooks/useFeatureFlags';
import { format } from 'date-fns';

export const FeatureFlagsManager = () => {
  const { flags, isLoading, createFlag, updateFlag, deleteFlag } = useFeatureFlags();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState({
    flag_name: '',
    description: '',
    is_enabled: false,
    rollout_percentage: 0,
    target_roles: ['user'] as string[],
    conditions: {},
  });

  const resetForm = () => {
    setFormData({
      flag_name: '',
      description: '',
      is_enabled: false,
      rollout_percentage: 0,
      target_roles: ['user'],
      conditions: {},
    });
    setEditingFlag(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFlag) {
      updateFlag({ id: editingFlag.id, ...formData });
    } else {
      createFlag(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      flag_name: flag.flag_name,
      description: flag.description || '',
      is_enabled: flag.is_enabled,
      rollout_percentage: flag.rollout_percentage,
      target_roles: flag.target_roles,
      conditions: flag.conditions,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this feature flag?')) {
      deleteFlag(id);
    }
  };

  const handleToggle = (flag: FeatureFlag) => {
    updateFlag({ id: flag.id, is_enabled: !flag.is_enabled });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Feature Flags</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Feature Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingFlag ? 'Edit Feature Flag' : 'Create New Feature Flag'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flag_name">Flag Name</Label>
                    <Input
                      id="flag_name"
                      value={formData.flag_name}
                      onChange={(e) => setFormData({ ...formData, flag_name: e.target.value })}
                      placeholder="feature-name"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_enabled"
                      checked={formData.is_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                    />
                    <Label htmlFor="is_enabled">Enabled</Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this feature flag controls"
                  />
                </div>

                <div>
                  <Label htmlFor="rollout_percentage">Rollout Percentage: {formData.rollout_percentage}%</Label>
                  <Slider
                    id="rollout_percentage"
                    min={0}
                    max={100}
                    step={1}
                    value={[formData.rollout_percentage]}
                    onValueChange={(value) => setFormData({ ...formData, rollout_percentage: value[0] })}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingFlag ? 'Update' : 'Create'} Flag
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
                <TableHead>Flag Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rollout</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags?.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell className="font-mono">{flag.flag_name}</TableCell>
                  <TableCell>{flag.description}</TableCell>
                  <TableCell>
                    <Badge variant={flag.is_enabled ? "default" : "secondary"}>
                      {flag.is_enabled ? (
                        <>
                          <Flag className="h-3 w-3 mr-1" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <FlagOff className="h-3 w-3 mr-1" />
                          Disabled
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{flag.rollout_percentage}%</TableCell>
                  <TableCell>{format(new Date(flag.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant={flag.is_enabled ? "destructive" : "default"}
                        onClick={() => handleToggle(flag)}
                      >
                        {flag.is_enabled ? <FlagOff className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(flag)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(flag.id)}>
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