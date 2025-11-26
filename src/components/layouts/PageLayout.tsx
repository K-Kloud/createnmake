
import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { useTranslation } from "react-i18next";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveText } from "@/components/ui/responsive-text";

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
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className={`flex-grow pt-20 sm:pt-24 space-y-8 sm:space-y-12 ${className}`}>
        {showBreadcrumbs && (
          <ResponsiveContainer padding="md" className="py-3 sm:py-4 bg-card/30 border-b border-border/40">
            <Breadcrumbs customItems={breadcrumbs} />
          </ResponsiveContainer>
        )}
        
        {(title || description) && (
          <ResponsiveContainer padding="md" className="py-6 sm:py-8 bg-gradient-to-b from-card/20 to-transparent">
            {title && (
              <ResponsiveText variant="h1" className="mb-3 sm:mb-4 gradient-text">
                {title}
              </ResponsiveText>
            )}
            {description && (
              <ResponsiveText variant="body" className="text-muted-foreground max-w-3xl">
                {description}
              </ResponsiveText>
            )}
          </ResponsiveContainer>
        )}
        
        <div className="space-y-8 sm:space-y-12">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
