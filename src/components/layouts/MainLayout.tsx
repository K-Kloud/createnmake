import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SEO, SEOProps } from "@/components/SEO";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
interface MainLayoutProps {
  children: ReactNode;
  seo?: SEOProps;
}
export const MainLayout = ({
  children,
  seo
}: MainLayoutProps) => {
  return <div className="min-h-screen bg-background flex flex-col">
      {seo && <SEO {...seo} />}
      <Header />
      <main className="flex-grow pt-16 sm:pt-20">
        <ResponsiveContainer padding="none" className="space-y-8 sm:space-y-12">
          
          {children}
        </ResponsiveContainer>
      </main>
      <Footer />
      <Toaster />
    </div>;
};