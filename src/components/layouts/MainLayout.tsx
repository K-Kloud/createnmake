
import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SEO, SEOProps } from "@/components/SEO";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { EnhancedBreadcrumbs } from "@/components/navigation/EnhancedBreadcrumbs";

interface MainLayoutProps {
  children: ReactNode;
  seo?: SEOProps;
}

export const MainLayout = ({ children, seo }: MainLayoutProps) => {

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {seo && <SEO {...seo} />}
      <Header />
      <main className="flex-grow pt-16 sm:pt-20">
        <ResponsiveContainer padding="none">
          <div className="container mx-auto px-4 py-2">
            <EnhancedBreadcrumbs />
          </div>
          {children}
        </ResponsiveContainer>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};
