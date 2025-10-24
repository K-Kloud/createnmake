import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2 } from 'lucide-react';
import { useCollections } from '@/hooks/useCollections';
import { useAuth } from '@/hooks/useAuth';
import { CreateCollectionDialog } from './CreateCollectionDialog';

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageId: number;
  imageUrl?: string;
}

export const AddToCollectionDialog: React.FC<AddToCollectionDialogProps> = ({
  open,
  onOpenChange,
  imageId,
  imageUrl,
}) => {
  const { user } = useAuth();
  const { collections, isLoading, addToCollection, isAddingToCollection } = useCollections(user?.id);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleToggleCollection = (collectionId: string) => {
    setSelectedCollections(prev => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedCollections.size === 0) {
      onOpenChange(false);
      return;
    }

    for (const collectionId of selectedCollections) {
      await addToCollection({ collectionId, imageId });
    }
    
    setSelectedCollections(new Set());
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Select collections to add this image to, or create a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Collection
            </Button>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : collections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                You don't have any collections yet. Create one to get started!
              </p>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleToggleCollection(collection.id)}
                    >
                      <Checkbox
                        checked={selectedCollections.has(collection.id)}
                        onCheckedChange={() => handleToggleCollection(collection.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{collection.name}</p>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {collection.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {collection.image_count} {collection.image_count === 1 ? 'image' : 'images'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedCollections.size === 0 || isAddingToCollection}
            >
              {isAddingToCollection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add to {selectedCollections.size} {selectedCollections.size === 1 ? 'Collection' : 'Collections'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
};
