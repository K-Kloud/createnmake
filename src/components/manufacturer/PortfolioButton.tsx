import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PortfolioGrid } from "./PortfolioGrid";

interface PortfolioButtonProps {
  name: string;
  producedItems: {
    id: number;
    generatedImage: string;
    productImage: string;
    description: string;
  }[];
}

export const PortfolioButton = ({ name, producedItems }: PortfolioButtonProps) => {
  if (producedItems.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{name}'s Portfolio</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PortfolioGrid items={producedItems} manufacturerName={name} />
        </div>
      </DialogContent>
    </Dialog>
  );
};