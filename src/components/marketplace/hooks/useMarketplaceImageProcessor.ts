
import { Session } from "@supabase/supabase-js";
import { transformImageWithMetrics, transformImageWithDefaultMetrics } from "./useMarketplaceTransformers";
import { fetchBatchImageComments, fetchCommentsWithReplies } from "./useMarketplaceCommentsFetcher";

export const processMarketplaceImage = async (image: any, session: Session | null, commentsMap: Record<number, any[]> = {}) => {
  try {
    // Validate image URL
    if (!image.image_url) {
      console.warn(`⚠️ Image ${image.id} has no URL`);
      return null;
    }

    // Log image URL for debugging
    console.log(`🖼️ Processing image ${image.id}:`, image.image_url, `Likes: ${image.likes || 0}`);

    // Get comments from batch or fallback to individual fetch
    const comments = commentsMap[image.id] || [];
    const commentsWithReplies = await fetchCommentsWithReplies(comments);

    // Use the synchronized likes count from generated_images table
    const metricsMap = {
      like: image.likes || 0, // Now this should be accurate thanks to our sync
      comment: comments?.length || 0,
      view: image.views || 0
    };

    const imageWithComments = { ...image, comments: commentsWithReplies };
    
    return transformImageWithMetrics(imageWithComments, session, metricsMap);
  } catch (error) {
    console.error(`❌ Error processing image ${image.id}:`, error);
    return transformImageWithDefaultMetrics(image, session);
  }
};

export const processMarketplaceImages = async (images: any[], session: Session | null) => {
  // Batch fetch all comments for all images to reduce network requests
  const imageIds = images.map(img => img.id);
  const commentsMap = await fetchBatchImageComments(imageIds);

  // Process images in parallel for better performance
  const processedImages = await Promise.allSettled(
    images.map(async (image) => processMarketplaceImage(image, session, commentsMap))
  );

  // Filter out failed transformations and null values
  const validImages = processedImages
    .filter((result): result is PromiseFulfilledResult<any> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);

  console.log(`✅ Successfully processed ${validImages.length} images`);
  return validImages;
};
