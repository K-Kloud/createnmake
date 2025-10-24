import { useParams, useNavigate } from 'react-router-dom';
import { usePublicCollections } from '@/hooks/usePublicCollections';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Images, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShareCollectionDialog } from '@/components/collections/ShareCollectionDialog';
import { CollectionStats } from '@/components/collections/CollectionStats';
import { useCollectionAnalytics } from '@/hooks/useCollectionAnalytics';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const { trackView } = useCollectionAnalytics(id);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  // Track collection view
  useEffect(() => {
    if (id) {
      trackView(id);
    }
  }, [id, trackView]);

  const {
    useCollectionDetail,
    followCollection,
    unfollowCollection,
    isFollowing,
    isUnfollowing,
  } = usePublicCollections(userId || undefined);

  const { data: collection, isLoading } = useCollectionDetail(id!);

  // Fetch collection images
  useEffect(() => {
    if (!id) return;

    const fetchImages = async () => {
      setLoadingImages(true);
      const { data, error } = await supabase
        .from('collection_images')
        .select(`
          image_id,
          generated_images!inner(*)
        `)
        .eq('collection_id', id);

      if (!error && data) {
        setImages(data.map((item: any) => item.generated_images));
      }
      setLoadingImages(false);
    };

    fetchImages();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
          <Button onClick={() => navigate('/collections')}>
            Browse Collections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
            {collection.description && (
              <p className="text-muted-foreground text-lg mb-4">
                {collection.description}
              </p>
            )}

            {/* Tags */}
            {collection.tags && collection.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {collection.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <span>{collection.follower_count} followers</span>
              </div>
              <div className="flex items-center gap-2">
                <Images className="h-5 w-5" />
                <span>{collection.image_count} images</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            {userId && (
              <Button
                size="sm"
                variant={collection.is_following ? 'default' : 'outline'}
                onClick={() => {
                  if (collection.is_following) {
                    unfollowCollection(collection.id);
                  } else {
                    followCollection(collection.id);
                  }
                }}
                disabled={isFollowing || isUnfollowing}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    collection.is_following ? 'fill-current' : ''
                  }`}
                />
                {collection.is_following ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Collection Statistics */}
      <div className="mb-8">
        <CollectionStats collectionId={collection.id} />
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loadingImages ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))
        ) : images.length > 0 ? (
          images.map((image) => (
            <div
              key={image.id}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => navigate(`/marketplace?image=${image.id}`)}
            >
              <img
                src={image.image_url}
                alt={image.prompt}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No images in this collection yet.
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <ShareCollectionDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        collection={collection}
      />
    </div>
  );
}
