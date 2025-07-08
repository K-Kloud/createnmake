
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 9;

export const fetchMarketplaceImages = async (pageParam: number = 0) => {
  console.log(`🔍 Fetching marketplace images - page ${pageParam}`);
  const from = pageParam * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Get images with profile relationships and likes from the generated_images table
  const { data: images, error } = await supabase
    .from('generated_images')
    .select(`
      *,
      profiles!generated_images_user_id_fkey (
        username,
        display_name,
        first_name,
        last_name,
        avatar_url
      ),
      image_likes(user_id)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error("❌ Error fetching images:", error);
    throw error;
  }

  if (!images || images.length === 0) {
    console.log("📭 No images found for this page");
    return [];
  }

  console.log(`✅ Found ${images.length} images`);
  return images;
};

export { ITEMS_PER_PAGE };
