
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "./PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

interface AuthenticatedLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  redirectTo?: string;
}

export const AuthenticatedLayout = ({ 
  children, 
  title, 
  description, 
  className,
  redirectTo = "/auth"
}: AuthenticatedLayoutProps) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate(redirectTo);
    }
  }, [session, loading, navigate, redirectTo]);

  if (loading) {
    return (
      <PageLayout title={title} description={description}>
        <LoadingState isLoading={true}>
          <div className="h-64" />
        </LoadingState>
      </PageLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageLayout title={title} description={description} className={className}>
      {children}
    </PageLayout>
  );
};
