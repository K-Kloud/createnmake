
import { Separator } from "@/components/ui/separator";

interface PriceBreakdownProps {
  basePrice: number;
  estimatedShipping: number;
}

export const PriceBreakdown = ({ basePrice, estimatedShipping }: PriceBreakdownProps) => {
  const creatorEarnings = basePrice * 0.70; // 70% to creator
  const platformFee = basePrice * 0.30; // 30% platform fee
  const totalPrice = basePrice + estimatedShipping;

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Price Breakdown</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Base Price</span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Creator Earnings (70%)</span>
          <span>${creatorEarnings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Platform Fee (30%)</span>
          <span>${platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Shipping</span>
          <span>${estimatedShipping.toFixed(2)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
