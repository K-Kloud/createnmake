
import { ReactNode } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SEOProps } from "@/components/SEO";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface StandardPageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  className?: string;
  seo?: SEOProps;
}

export const StandardPageLayout = ({ 
  children, 
  title, 
  description, 
  breadcrumbs, 
  showBreadcrumbs = true,
  className = "",
  seo
}: StandardPageLayoutProps) => {
  return (
    <MainLayout seo={seo}>
      <div className={`container mx-auto px-4 pt-8 pb-12 max-w-7xl ${className}`}>
        {showBreadcrumbs && (
          <div className="mb-6">
            <Breadcrumbs customItems={breadcrumbs} />
          </div>
        )}
        
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold mb-2 gradient-text">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground text-lg">{description}</p>
            )}
          </div>
        )}
        
        {children}
      </div>
    </MainLayout>
  );
};
