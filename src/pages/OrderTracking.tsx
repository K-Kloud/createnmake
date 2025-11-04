import { useParams } from "react-router-dom";
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { FileText, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RealTimeOrderTracker } from "@/components/customer/RealTimeOrderTracker";
import { InvoiceViewer } from "@/components/customer/InvoiceViewer";
import { MakerRatingDialog } from "@/components/customer/MakerRatingDialog";

const OrderTracking = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const { user } = useAuth();
  const [showInvoice, setShowInvoice] = useState(false);
  const [showRating, setShowRating] = useState(false);
  
  const orderType = type as 'artisan' | 'manufacturer';

  if (!id || !orderType) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Invalid order details</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <RealTimeOrderTracker orderId={id} orderType={orderType} />
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInvoice(true)}>
              <FileText className="w-4 h-4 mr-2" />
              View Invoice
            </Button>
            <Button variant="outline" onClick={() => setShowRating(true)}>
              <Star className="w-4 h-4 mr-2" />
              Rate Maker
            </Button>
          </div>
        </div>
      </div>

      <InvoiceViewer
        open={showInvoice}
        onOpenChange={setShowInvoice}
        orderId={id}
        orderType={orderType}
      />

      <MakerRatingDialog
        open={showRating}
        onOpenChange={setShowRating}
        makerId="maker-id"
        makerName="Professional Maker"
        makerType={orderType}
        orderId={id}
      />
    </MainLayout>
  );
};

export default OrderTracking;
