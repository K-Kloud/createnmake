import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layouts/MainLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Eye, MessageCircle, Share2, User } from "lucide-react";
import { Comments } from "@/components/gallery/Comments";
import { ImageActions } from "@/components/gallery/ImageActions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const ImageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: image, isLoading } = useQuery({
    queryKey: ['image-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Image ID is required');

      const { data, error } = await supabase
        .from('generated_images')
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/image/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: image?.title || 'Check out this design',
          text: image?.prompt || 'Amazing AI-generated fashion design',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "The image link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Sharing failed",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!image) {
    return (
      <MainLayout
        seo={{
          title: "Design Not Found",
          description: "The design you're looking for could not be found.",
          noIndex: true
        }}
      >
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Design Not Found</h1>
          <p className="text-muted-foreground">
            The design you're looking for could not be found or is not public.
          </p>
        </div>
      </MainLayout>
    );
  }

  const creator = image.profiles;
  const creatorName = creator?.display_name || `Creator ${creator?.id?.slice(0, 8)}`;
  const imageUrl = `${window.location.origin}/image/${image.id}`;
  const imageTitle = image.title || `${image.item_type} Design`;

  return (
    <MainLayout
      seo={{
        title: `${imageTitle} by ${creatorName}`,
        description: image.prompt.length > 150 ? `${image.prompt.substring(0, 150)}...` : image.prompt,
        canonical: imageUrl,
        ogImage: image.image_url || undefined,
        ogType: "article",
        keywords: [
          "fashion design",
          "AI generated",
          image.item_type,
          ...(image.tags || [])
        ]
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Image */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={image.image_url || '/placeholder.svg'}
                    alt={image.prompt}
                    className="w-full h-auto rounded-t-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <ImageActions
                      image={{
                        id: image.id,
                        url: image.image_url || '',
                        prompt: image.prompt,
                        likes: image.likes || 0,
                        views: image.views || 0,
                        hasLiked: false, // This would need to be determined from user's likes
                        user_id: image.user_id,
                        timeAgo: new Date(image.created_at).toLocaleDateString(),
                        creator: { name: creatorName, avatar: creator?.avatar_url || '' },
                        comments: [],
                        produced: 0,
                        createdAt: new Date(image.created_at),
                        image_likes: [],
                        metrics: {
                          like: image.likes || 0,
                          comment: 0,
                          view: image.views || 0
                        },
                        item_type: image.item_type,
                        tags: image.tags || [],
                        price: image.price
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={creator?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{creatorName}</div>
                    <div className="text-sm text-muted-foreground">Creator</div>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Design Details */}
            <Card>
              <CardHeader>
                <CardTitle>Design Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {image.title && (
                  <div>
                    <h3 className="font-semibold">{image.title}</h3>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{image.prompt}</p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {image.item_type}
                  </Badge>
                  {image.price && (
                    <Badge variant="secondary">
                      £{image.price}
                    </Badge>
                  )}
                </div>

                {image.tags && image.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {image.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {image.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {image.views || 0}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              {image.price && (
                <Button className="w-full">
                  Request Quote - £{image.price}
                </Button>
              )}
              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Creator
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <Comments imageId={parseInt(id!)} />
        </div>
      </div>
    </MainLayout>
  );
};

export default ImageDetail;