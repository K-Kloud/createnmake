import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { initialImages } from "@/data/marketplace";

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState(initialImages.map(img => ({
    ...img,
    comments: []
  })));

  const handleLike = (imageId: number) => {
    setGalleryImages(prevImages =>
      prevImages.map(image => {
        if (image.id === imageId) {
          return {
            ...image,
            likes: image.hasLiked ? image.likes - 1 : image.likes + 1,
            hasLiked: !image.hasLiked
          };
        }
        return image;
      })
    );
  };

  const handleView = (imageId: number) => {
    setGalleryImages(prevImages =>
      prevImages.map(image => {
        if (image.id === imageId) {
          return {
            ...image,
            views: image.views + 1
          };
        }
        return image;
      })
    );
  };

  const handleAddComment = (imageId: number, commentText: string) => {
    setGalleryImages(prevImages =>
      prevImages.map(image => {
        if (image.id === imageId) {
          const newComment = {
            id: Date.now(),
            text: commentText,
            user: {
              name: "Anonymous User",
              avatar: "https://github.com/shadcn.png"
            },
            createdAt: new Date(),
            replies: []
          };
          return {
            ...image,
            comments: [...image.comments, newComment]
          };
        }
        return image;
      })
    );
  };

  const handleAddReply = (imageId: number, commentId: number, replyText: string) => {
    setGalleryImages(prevImages =>
      prevImages.map(image => {
        if (image.id === imageId) {
          return {
            ...image,
            comments: image.comments.map(comment => {
              if (comment.id === commentId) {
                const newReply = {
                  id: Date.now(),
                  text: replyText,
                  user: {
                    name: "Anonymous User",
                    avatar: "https://github.com/shadcn.png"
                  },
                  createdAt: new Date()
                };
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newReply]
                };
              }
              return comment;
            })
          };
        }
        return image;
      })
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <MarketplaceHeader />
        <MarketplaceGrid
          images={galleryImages}
          onLike={handleLike}
          onView={handleView}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Gallery;