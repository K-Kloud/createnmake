
import { PageLayout } from "@/components/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation(['common', 'navigation']);

  return (
    <PageLayout 
      title="Page Not Found | 404"
      description="The page you are looking for does not exist or has been moved"
      className="flex-grow flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/">{t('navigation:main.home')}</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/create">{t('navigation:main.create')}</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
