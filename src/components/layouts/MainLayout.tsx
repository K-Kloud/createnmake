import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SEO, SEOProps } from "@/components/SEO";
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
      <main className="flex-grow pt-16 px-0 py-0">
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>;
};