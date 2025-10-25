import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { virtualTryOnService } from "@/services/virtualTryOn";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { CreateTryOnSessionParams, GenerateTryOnParams } from "@/types/tryon";

export const useVirtualTryOn = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload body reference image
  const uploadBodyReference = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not authenticated");
      return virtualTryOnService.uploadBodyReference(file, user.id);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });

  // Create try-on session
  const createSession = useMutation({
    mutationFn: (params: CreateTryOnSessionParams) =>
      virtualTryOnService.createSession(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tryon-history"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Session Creation Failed",
        description: error.message,
      });
    },
  });

  // Generate try-on result
  const generateTryOn = useMutation({
    mutationFn: (params: GenerateTryOnParams) =>
      virtualTryOnService.generateTryOn(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tryon-history"] });
      toast({
        title: "Try-On Complete!",
        description: "Your virtual try-on has been generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Try-On Failed",
        description: error.message,
      });
    },
  });

  // Get try-on history
  const {
    data: history,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["tryon-history"],
    queryFn: () => virtualTryOnService.getTryOnHistory(),
    enabled: !!user,
  });

  // Delete session
  const deleteSession = useMutation({
    mutationFn: (sessionId: number) =>
      virtualTryOnService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tryon-history"] });
      toast({
        title: "Session Deleted",
        description: "Try-on session has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    },
  });

  return {
    uploadBodyReference: uploadBodyReference.mutateAsync,
    isUploadingBody: uploadBodyReference.isPending,
    createSession: createSession.mutateAsync,
    isCreatingSession: createSession.isPending,
    generateTryOn: generateTryOn.mutateAsync,
    isGenerating: generateTryOn.isPending,
    history,
    isLoadingHistory,
    refetchHistory,
    deleteSession: deleteSession.mutateAsync,
    isDeletingSession: deleteSession.isPending,
  };
};
