
import React from "react";
import { GalleryImage } from "@/types/gallery";
import { useImprovedImageGallery } from "./hooks/useImprovedImageGallery";
import { GalleryLoadingState } from "./components/GalleryLoadingState";
import { GalleryErrorState } from "./components/GalleryErrorState";
import { GalleryEmptyState } from "./components/GalleryEmptyState";
import { GalleryImageGrid } from "./components/GalleryImageGrid";

interface ImprovedImageGalleryProps {
  onImageClick?: (image: GalleryImage) => void;
  showUserImagesOnly?: boolean;
  images?: GalleryImage[];
  onLike?: (imageId: number) => void;
  onView?: (imageId: number) => void;
  onAddComment?: (imageId: number, comment: string) => void;
  onAddReply?: (imageId: number, commentId: number, reply: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const ImprovedImageGallery = (props: ImprovedImageGalleryProps) => {
  const {
    displayImages,
    displayLoading,
    displayError,
    handleLike,
    handleView,
    handleAddComment,
    handleAddReply,
    handleRetry,
    t
  } = useImprovedImageGallery(props);

  if (displayLoading) {
    return <GalleryLoadingState />;
  }

  if (displayError) {
    return <GalleryErrorState onRetry={handleRetry} t={t} />;
  }

  if (displayImages.length === 0) {
    return <GalleryEmptyState onRetry={handleRetry} t={t} />;
  }

  return (
    <GalleryImageGrid
      images={displayImages}
      onLike={handleLike}
      onView={handleView}
      onAddComment={handleAddComment}
      onAddReply={handleAddReply}
      onImageClick={props.onImageClick}
    />
  );
};
