
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface MakerNotFoundProps {
  error?: Error | null;
  makerId?: string;
  makerType?: string | null;
}

export const MakerNotFound = ({ error, makerId, makerType }: MakerNotFoundProps) => {
  console.log('Maker not found or error:', { error, makerId, makerType });
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Maker not found</h1>
        <p className="mt-4">The maker you are looking for does not exist or you don't have permission to view it.</p>
        {error && (
          <p className="mt-2 text-red-500">Error: {error.message}</p>
        )}
      </main>
      <Footer />
    </div>
  );
};
