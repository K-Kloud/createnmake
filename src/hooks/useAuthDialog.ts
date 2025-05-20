
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const useAuthDialog = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { session } = useAuth();
  
  const isSignedIn = !!session?.user;

  return {
    authDialogOpen,
    setAuthDialogOpen,
    isSignedIn,
    session
  };
};
