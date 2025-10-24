import React, { useState } from 'react';
import { MoreVertical, Eye, EyeOff, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Collection } from '@/hooks/useCollections';
import { EditCollectionDialog } from './EditCollectionDialog';
import { DeleteCollectionDialog } from './DeleteCollectionDialog';

interface MyCollectionCardProps {
  collection: Collection;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

export const MyCollectionCard = ({ collection, viewMode, onClick }: MyCollectionCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  if (viewMode === 'list') {
    return (
      <>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {collection.cover_image_url ? (
                  <img
                    src={collection.cover_image_url}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{collection.name}</h3>
                  <Badge variant={collection.is_public ? 'default' : 'secondary'}>
                    {collection.is_public ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                </div>
                {collection.description && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {collection.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {collection.image_count} {collection.image_count === 1 ? 'image' : 'images'}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
        <EditCollectionDialog
          collection={collection}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
        <DeleteCollectionDialog
          collection={collection}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={onClick}>
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] bg-muted rounded-t-lg overflow-hidden">
            {collection.cover_image_url ? (
              <img
                src={collection.cover_image_url}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Badge
              variant={collection.is_public ? 'default' : 'secondary'}
              className="absolute bottom-2 left-2"
            >
              {collection.is_public ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
          </div>
          <div className="p-4">
            <h3 className="font-semibold truncate">{collection.name}</h3>
            {collection.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {collection.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {collection.image_count} {collection.image_count === 1 ? 'image' : 'images'}
            </p>
          </div>
        </CardContent>
      </Card>
      <EditCollectionDialog
        collection={collection}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <DeleteCollectionDialog
        collection={collection}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};
