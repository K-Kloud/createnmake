import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Share2, 
  Copy, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Download,
  Link,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SocialSharingProps {
  imageUrl: string;
  imageId: string;
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedSocialSharing: React.FC<SocialSharingProps> = ({
  imageUrl,
  imageId,
  title = 'Check out this amazing AI-generated image!',
  description = 'Created with OpenTeknologies AI Image Generator',
  isOpen,
  onClose
}) => {
  const [customMessage, setCustomMessage] = useState(title);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const trackShareMutation = useMutation({
    mutationFn: async (platform: string) => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          target_content_id: parseInt(imageId),
          interaction_type: 'share',
          interaction_data: { platform }
        });

      if (error) throw error;
    }
  });

  const generateShareableLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Create a shareable link (this would typically involve your backend)
      const shareUrl = `${window.location.origin}/image/${imageId}`;
      setShareableLink(shareUrl);
      toast({
        title: "Link Generated",
        description: "Shareable link has been created!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate shareable link",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const url = shareableLink || `${window.location.origin}/image/${imageId}`;
    const text = encodeURIComponent(customMessage);
    const encodedUrl = encodeURIComponent(url);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${text}%0A%0A${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      trackShareMutation.mutate(platform);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: customMessage,
          url: shareableLink || `${window.location.origin}/image/${imageId}`
        });
        trackShareMutation.mutate('native');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: "Error",
            description: "Failed to share",
            variant: "destructive",
          });
        }
      }
    }
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `openteknologies-image-${imageId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      trackShareMutation.mutate('download');
      toast({
        title: "Downloaded!",
        description: "Image saved to your device",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">Custom Message</Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add your own message..."
              rows={3}
            />
          </div>

          {/* Generate shareable link */}
          <div className="space-y-2">
            <Label>Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareableLink}
                placeholder="Click generate to create a shareable link"
                readOnly
              />
              <Button
                onClick={generateShareableLink}
                disabled={isGeneratingLink}
                size="sm"
              >
                <Link className="w-4 h-4" />
              </Button>
            </div>
            {shareableLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareableLink)}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            )}
          </div>

          {/* Social sharing buttons */}
          <div className="space-y-3">
            <Label>Share to Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => shareToSocial('twitter')}
                className="flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('facebook')}
                className="flex items-center gap-2"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('whatsapp')}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Additional actions */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => shareToSocial('email')}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={downloadImage}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            
            {/* Native share API if available */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share via Device
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};