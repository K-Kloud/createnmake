import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

export const SocialShare = ({ title, text, url, hashtags = [] }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = url || window.location.href;
  const hashtagString = hashtags.join(',');

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}${hashtags.length > 0 ? `&hashtags=${hashtagString}` : ''}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
      setCopied(true);
      toast({
        title: 'Copied to clipboard!',
        description: 'Share link copied successfully',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Achievement
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareOnTwitter} className="gap-2 cursor-pointer">
          <Twitter className="h-4 w-4 text-[#1DA1F2]" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnLinkedIn} className="gap-2 cursor-pointer">
          <Linkedin className="h-4 w-4 text-[#0A66C2]" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook} className="gap-2 cursor-pointer">
          <Facebook className="h-4 w-4 text-[#1877F2]" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
        {navigator.share && (
          <DropdownMenuItem onClick={nativeShare} className="gap-2 cursor-pointer">
            <Share2 className="h-4 w-4" />
            More Options
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
