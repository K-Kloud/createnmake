import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
            <TableCell>{image.title || image.prompt}</TableCell>
            <TableCell>{image.profiles?.username || 'Anonymous'}</TableCell>
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
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};