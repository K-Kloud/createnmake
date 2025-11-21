import { useState, useEffect } from "react";
import { ExploreSidebar } from "@/components/layouts/ExploreSidebar";
import { MasonryImageCard } from "@/components/gallery/MasonryImageCard";
import { GalleryImage } from "@/types/gallery";
import { Search, SlidersHorizontal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePreviewDialog } from "@/components/gallery/ImagePreviewDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ExploreGallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("generated_images")
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const formattedImages: GalleryImage[] = (data || []).map((img: any) => ({
          id: img.id,
          url: img.image_url,
          prompt: img.prompt || "",
          likes: 0,
          comments: [],
          views: 0,
          produced: 0,
          creator: {
            name: img.profiles?.full_name || "Anonymous",
            avatar: img.profiles?.avatar_url || "/placeholder.svg"
          },
          createdAt: new Date(img.created_at),
          timeAgo: formatTimeAgo(new Date(img.created_at)),
          hasLiked: false,
          image_likes: [],
          metrics: { like: 0, comment: 0, view: 0 },
          user_id: img.user_id
        }));

        setImages(formattedImages);
      } catch (error: any) {
        console.error("Error fetching images:", error);
        toast({
          title: "Error",
          description: "Failed to load images",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [toast]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const onLike = async (imageId: number) => {
    console.log("Like image:", imageId);
  };

  const onView = async (imageId: number) => {
    console.log("View image:", imageId);
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setShowImageDialog(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <ExploreSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-border/40 backdrop-blur-xl bg-card/80 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search designs, creators, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-10 bg-background/50 border-border/50 rounded-xl font-medium focus:border-primary/50 transition-all"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 hover:bg-muted hover:border-primary/30">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
              <Zap className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 100%)' }}>
        {isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="break-inside-avoid aspect-[3/4] bg-card/50 border border-border/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-4">
            {images.map((image) => (
              <div key={image.id} className="break-inside-avoid">
                <MasonryImageCard
                  image={image}
                  onLike={onLike}
                  onView={onView}
                  onClick={() => handleImageClick(image)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      {/* Image Preview Dialog */}
      {selectedImage && (
        <ImagePreviewDialog
          open={showImageDialog}
          onOpenChange={setShowImageDialog}
          imageUrl={selectedImage.url}
          prompt={selectedImage.prompt}
          imageId={selectedImage.id}
          userId={selectedImage.user_id}
          showPrompt={true}
          zoomLevel={1}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
        />
      )}
    </div>
  );
};

export default ExploreGallery;
