
import { Session } from "@supabase/supabase-js";
import { transformImageWithMetrics, transformImageWithDefaultMetrics } from "./useMarketplaceTransformers";
import { fetchImageComments, fetchCommentsWithReplies } from "./useMarketplaceCommentsFetcher";

export const processMarketplaceImage = async (image: any, session: Session | null) => {
  try {
    // Validate image URL
    if (!image.image_url) {
      console.warn(`⚠️ Image ${image.id} has no URL`);
      return null;
    }

    // Log image URL for debugging
    console.log(`🖼️ Processing image ${image.id}:`, image.image_url, `Likes: ${image.likes || 0}`);

    // Get comments with replies
    const comments = await fetchImageComments(image.id);
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
  // Process images in parallel for better performance
  const processedImages = await Promise.allSettled(
    images.map(async (image) => processMarketplaceImage(image, session))
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
