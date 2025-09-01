
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface UsageInfoProps {
  imagesGenerated?: number;
  monthlyImageLimit?: number;
  tier?: string;
  canGenerateImage?: boolean;
  onUpgrade?: () => void;
  isSignedIn?: boolean;
  remainingImages?: number;
}

export const UsageInfo = ({ 
  imagesGenerated = 0, 
  monthlyImageLimit = 10, 
  tier = "free", 
  canGenerateImage = true,
  onUpgrade = () => console.log('Upgrade clicked'),
  isSignedIn = false,
  remainingImages
}: UsageInfoProps) => {
  
  // If the user is not signed in, show a simplified version
  if (!isSignedIn) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-4 pb-3 px-4 text-center text-sm">
          <p>Sign in to generate images and track your usage</p>
        </CardContent>
      </Card>
    );
  }

  // Use remainingImages if provided, otherwise calculate from other values
  const actualImagesGenerated = remainingImages !== undefined 
    ? monthlyImageLimit - remainingImages 
    : imagesGenerated;
  
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">
            Images this month: {actualImagesGenerated} of {monthlyImageLimit}
          </div>
          <div className="text-sm">
            {tier !== "free" ? (
              <span className="text-primary font-medium">{tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</span>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-primary hover:text-primary flex items-center gap-1"
                onClick={onUpgrade}
              >
                <Zap className="w-3 h-3" /> Upgrade
              </Button>
            )}
          </div>
        </div>

        <Progress
          value={(actualImagesGenerated / monthlyImageLimit) * 100}
          className="h-1.5"
        />

        {!canGenerateImage && (
          <div className="mt-2 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs" 
              onClick={onUpgrade}
            >
              Upgrade to generate more images
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
