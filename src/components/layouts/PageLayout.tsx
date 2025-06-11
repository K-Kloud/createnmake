
import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const PageLayout = ({ 
  children, 
  title = "Create2Make", 
  description = "Connect with skilled artisans and manufacturers",
  className = "container px-4 py-24 flex-grow"
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <Header />
      <main className={className}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
