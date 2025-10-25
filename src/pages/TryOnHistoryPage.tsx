import { TryOnGallery } from "@/components/tryon/TryOnGallery";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TryOnHistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Virtual Try-On History</h1>
            <p className="text-muted-foreground">
              View all your virtual try-on sessions and results
            </p>
          </div>
        </div>

        <TryOnGallery />
      </div>
    </div>
  );
};
