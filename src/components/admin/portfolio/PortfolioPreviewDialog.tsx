import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PortfolioPreviewDialogProps {
  item: any | null;
  onClose: () => void;
}

export const PortfolioPreviewDialog = ({ item, onClose }: PortfolioPreviewDialogProps) => {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Portfolio Item Preview</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Generated Design</h3>
            <img
              src={item.generatedimage}
              alt="Generated design"
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">Made Product</h3>
            <img
              src={item.productimage}
              alt="Made product"
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};