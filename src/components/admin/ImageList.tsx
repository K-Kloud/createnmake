import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ImageListProps {
  images: any[];
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

export const ImageList = ({ images, onDelete, onView }: ImageListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Preview</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead>Stats</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {images.map((image) => (
          <TableRow key={image.id}>
            <TableCell>
              <img 
                src={image.image_url} 
                alt={image.title || image.prompt}
                className="w-16 h-16 object-cover rounded"
              />
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{image.title || 'Untitled'}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {image.prompt}
                </div>
              </div>
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
              <div className="space-y-1 text-sm">
                <div>Likes: {image.likes || 0}</div>
                <div>Views: {image.views || 0}</div>
              </div>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onView(image.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(image.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {images.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              No images found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};