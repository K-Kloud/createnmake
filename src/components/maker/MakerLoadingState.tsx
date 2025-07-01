
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export const MakerLoadingState = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </main>
      <Footer />
    </div>
  );
};
