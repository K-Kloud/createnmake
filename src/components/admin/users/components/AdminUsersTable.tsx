
import { AdminUser } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminUsersTableProps {
  admins: AdminUser[];
  isLoading: boolean;
  searchTerm: string;
  onRemoveAdmin: (userId: string) => void;
  isRemoving: boolean;
  removingId?: string;
}

export const AdminUsersTable = ({
  admins,
  isLoading,
  searchTerm,
  onRemoveAdmin,
  isRemoving,
  removingId,
}: AdminUsersTableProps) => {
  const filteredAdmins = admins?.filter(
    (admin) =>
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email/Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : filteredAdmins?.length ? (
            filteredAdmins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(admin.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveAdmin(admin.id)}
                    disabled={isRemoving}
                  >
                    {isRemoving && removingId === admin.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                {searchTerm
                  ? "No matching admin users found"
                  : "No admin users found"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
