import { useState } from 'react';
import { FolderPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollections } from '@/hooks/useCollections';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AddToCollectionButtonProps {
  imageId: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const AddToCollectionButton = ({
  imageId,
  variant = 'outline',
  size = 'sm',
  showLabel = true,
}: AddToCollectionButtonProps) => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUserId(session?.user?.id || null);
  });

  const {
    collections,
    isLoading,
    createCollection,
    addToCollection,
    isAddingToCollection,
    isCreatingCollection,
  } = useCollections(userId || undefined);

  const handleAddToCollection = (collectionId: string) => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to add images to collections.',
      });
      return;
    }

    addToCollection({ collectionId, imageId });
  };

  const handleCreateAndAdd = () => {
    if (!newCollectionName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter a collection name.',
      });
      return;
    }

    createCollection(
      {
        name: newCollectionName,
        description: newCollectionDescription,
        isPublic: false,
      },
      {
        onSuccess: (data) => {
          // Add image to newly created collection
          addToCollection({ collectionId: data.id, imageId });
          setIsCreateDialogOpen(false);
          setNewCollectionName('');
          setNewCollectionDescription('');
        },
      }
    );
  };

  if (!userId) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={isLoading}>
            <FolderPlus className={showLabel ? 'mr-2 h-4 w-4' : 'h-4 w-4'} />
            {showLabel && 'Save'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {collections.length === 0 ? (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground text-sm">No collections yet</span>
            </DropdownMenuItem>
          ) : (
            collections.map((collection) => (
              <DropdownMenuItem
                key={collection.id}
                onClick={() => handleAddToCollection(collection.id)}
                disabled={isAddingToCollection}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{collection.name}</span>
                  {collection.image_count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {collection.image_count} {collection.image_count === 1 ? 'image' : 'images'}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create new collection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Create a new collection and add this image to it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Collection 2024"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your collection..."
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreatingCollection}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAndAdd} disabled={isCreatingCollection}>
              {isCreatingCollection ? 'Creating...' : 'Create & Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
