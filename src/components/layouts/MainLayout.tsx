
import { ReactNode, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SEO, SEOProps } from "@/components/SEO";
import { ResponsiveContainer } from "@/components/ui/responsive-container";

interface MainLayoutProps {
  children: ReactNode;
  seo?: SEOProps;
}

export const MainLayout = ({ children, seo }: MainLayoutProps) => {
  // Ensure dark mode is always applied
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {seo && <SEO {...seo} />}
      <Header />
      <main className="flex-grow pt-16 sm:pt-20">
        <ResponsiveContainer padding="none">
          {children}
        </ResponsiveContainer>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};
