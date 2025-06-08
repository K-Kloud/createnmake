
import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  className?: string;
}

export const PageLayout = ({ 
  children, 
  title, 
  description, 
  breadcrumbs, 
  showBreadcrumbs = true,
  className = "" 
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className={`flex-grow pt-20 ${className}`}>
        {showBreadcrumbs && (
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <Breadcrumbs customItems={breadcrumbs} />
          </div>
        )}
        
        {(title || description) && (
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {title && (
              <h1 className="text-3xl font-bold mb-2 gradient-text">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground text-lg">{description}</p>
            )}
          </div>
        )}
        
        {children}
      </main>
      
      <Footer />
    </div>
  );
};
