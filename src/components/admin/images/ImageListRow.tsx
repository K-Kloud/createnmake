import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface ImageListRowProps {
  image: any;
  onDelete: () => void;
  isDeleting?: boolean;
  editingId?: number | null;
  editData?: any;
  onEdit?: (image: any) => void;
  onSave?: (id: number) => void;
  onCancel?: () => void;
  onEditDataChange?: (data: any) => void;
}

export const ImageListRow = ({
  image,
  onDelete,
  isDeleting = false,
  editingId,
  editData,
  onEdit,
  onSave,
  onCancel,
  onEditDataChange,
}: ImageListRowProps) => {
  return (
    <TableRow key={image.id}>
      <TableCell>
        <img 
          src={image.image_url} 
          alt={image.title || image.prompt}
          className="w-16 h-16 object-cover rounded"
        />
      </TableCell>
      <TableCell>
        {editingId === image.id ? (
          <div className="space-y-2">
            <Input
              value={editData?.title}
              onChange={(e) => onEditDataChange?.({ ...editData, title: e.target.value })}
              placeholder="Title"
              className="mb-2"
            />
            <Input
              value={editData?.prompt}
              onChange={(e) => onEditDataChange?.({ ...editData, prompt: e.target.value })}
              placeholder="Prompt"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="font-medium">{image.title || 'Untitled'}</div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {image.prompt}
            </div>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image.profiles?.avatar_url} />
            <AvatarFallback>
              {image.profiles?.username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <span>{image.profiles?.username || 'Anonymous'}</span>
        </div>
      </TableCell>
      <TableCell>
        {editingId === image.id ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span>Likes:</span>
              <Input
                type="number"
                value={editData?.likes}
                onChange={(e) => onEditDataChange?.({ ...editData, likes: e.target.value })}
                className="w-20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span>Views:</span>
              <Input
                type="number"
                value={editData?.views}
                onChange={(e) => onEditDataChange?.({ ...editData, views: e.target.value })}
                className="w-20"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-sm">
            <div>Likes: {image.likes || 0}</div>
            <div>Views: {image.views || 0}</div>
          </div>
        )}
      </TableCell>
      <TableCell>
        {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          {editingId === image.id ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSave?.(image.id)}
                className="text-green-500 hover:text-green-600"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onCancel}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit?.(image)}
                disabled={isDeleting}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};