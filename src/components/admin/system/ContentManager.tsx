import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { ContentBlockEditor } from '@/components/admin/content/ContentBlockEditor';
import { useContentBlocks, useDeleteContentBlock } from '@/hooks/useContentManagement';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const ContentManager = () => {
  const { data: contentBlocks, isLoading } = useContentBlocks();
  const deleteMutation = useDeleteContentBlock();
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBlocks = contentBlocks?.filter(block =>
    block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.block_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.block_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (block: any) => {
    setEditingBlock(block);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingBlock(null);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingBlock(null);
  };

  if (showEditor) {
    return (
      <ContentBlockEditor
        contentBlock={editingBlock}
        onSave={handleEditorClose}
        onCancel={handleEditorClose}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Content Manager</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Content Block
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Search content blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredBlocks?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No content blocks found.</p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create your first content block
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBlocks?.map((block) => (
              <Card key={block.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{block.title}</h3>
                      <Badge variant="outline">{block.block_type}</Badge>
                      <Badge variant={block.is_active ? "default" : "secondary"}>
                        {block.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{block.locale}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Key: {block.block_key}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated: {new Date(block.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(block)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Content Block</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{block.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(block.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};