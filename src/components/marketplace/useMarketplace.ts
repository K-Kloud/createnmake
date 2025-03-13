
import { useMemo } from "react";
import { useLikeImage } from "./hooks/useLikeImage";
import { useViewImage } from "./hooks/useViewImage";
import { useCommentImage } from "./hooks/useCommentImage";
import { useToast } from "@/components/ui/use-toast";
import { useMarketplaceSession } from "./hooks/useMarketplaceSession";
import { useMarketplaceQuery } from "./hooks/useMarketplaceQuery";
import { useMarketplaceActions } from "./hooks/useMarketplaceActions";
import { transformImageWithMetrics, transformImageWithDefaultMetrics } from "./hooks/useMarketplaceTransformers";
import { formatDistanceToNow } from "date-fns";

export const useMarketplace = () => {
  const { toast } = useToast();
  const { session } = useMarketplaceSession();
  const likeMutation = useLikeImage();
  const viewMutation = useViewImage();
  const { commentMutation, replyMutation } = useCommentImage();

  const {
    data: images,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useMarketplaceQuery(session);

  const marketplaceActions = useMarketplaceActions({
    session,
    images: images?.pages?.flatMap(page => page) || [],
    likeMutation,
    viewMutation,
    commentMutation,
    replyMutation,
    toast
  });

  return {
    session,
    images,
    isLoading,
    likeMutation,
    viewMutation,
    commentMutation,
    replyMutation,
    toast,
    fetchNextPage,
    hasNextPage,
    ...marketplaceActions
  };
};
