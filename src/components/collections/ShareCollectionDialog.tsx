import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Facebook, Twitter, Link2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useCollectionAnalytics } from '@/hooks/useCollectionAnalytics';

interface ShareCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    name: string;
    description?: string;
  };
}

export const ShareCollectionDialog = ({
  open,
  onOpenChange,
  collection,
}: ShareCollectionDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { trackShare } = useCollectionAnalytics(collection.id);

  const shareUrl = `${window.location.origin}/collections/${collection.id}`;
  const shareText = `Check out this collection: ${collection.name}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShare(collection.id);
      toast({
        title: 'Link copied!',
        description: 'Share link has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy link to clipboard.',
      });
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook') => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    trackShare(collection.id);
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Collection</DialogTitle>
          <DialogDescription>
            Share this collection with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link */}
          <div className="flex items-center gap-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => handleShare('twitter')}
              className="gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare('facebook')}
              className="gap-2"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
          </div>

          {/* Direct Share (if supported) */}
          {navigator.share && (
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={() => {
                trackShare(collection.id);
                navigator.share({
                  title: collection.name,
                  text: shareText,
                  url: shareUrl,
                });
              }}
            >
              <Link2 className="h-4 w-4" />
              Share via...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
