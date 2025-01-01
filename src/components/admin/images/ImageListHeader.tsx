import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ImageListHeader = () => {
  return (
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
  );
};