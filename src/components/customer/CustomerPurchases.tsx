
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription, Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CustomerPurchasesProps {
  customerId: string;
}

export const CustomerPurchases = ({ customerId }: CustomerPurchasesProps) => {
  const { data: purchases, isLoading } = useQuery({
    queryKey: ['customer-purchases', customerId],
    queryFn: async () => {
      // For now, just returning an empty array
      // In a real implementation, this would query purchases
      return [];
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!purchases?.length) {
    return (
      <Card className="p-8 text-center">
        <CardTitle className="mb-2">You haven't made any purchases yet</CardTitle>
        <CardDescription className="mb-6">
          Browse our marketplace to find beautiful designs created by our talented community.
        </CardDescription>
        <Button onClick={() => window.location.href = '/marketplace'}>
          Browse Marketplace
        </Button>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Designer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-mono text-xs">{purchase.id}</TableCell>
                <TableCell>{new Date(purchase.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{purchase.product_name}</TableCell>
                <TableCell>{purchase.designer_name}</TableCell>
                <TableCell>
                  <Badge variant={
                    purchase.status === "delivered" ? "default" : 
                    purchase.status === "shipped" ? "secondary" : 
                    "outline"
                  }>
                    {purchase.status}
                  </Badge>
                </TableCell>
                <TableCell>£{purchase.amount}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
