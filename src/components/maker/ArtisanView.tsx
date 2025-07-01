
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Artisan } from "@/types/maker";

interface ArtisanViewProps {
  artisan: Artisan;
}

export const ArtisanView = ({ artisan }: ArtisanViewProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{artisan.business_name || artisan.username}</h1>
        <p className="mb-6">Artisan Profile</p>
        
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            {artisan.avatar_url ? (
              <img src={artisan.avatar_url} alt="Profile" className="w-16 h-16 rounded-full mr-4" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <span className="text-xl font-bold">
                  {(artisan.business_name || artisan.username || "A").charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{artisan.business_name || artisan.username}</h2>
              <p className="text-muted-foreground">{artisan.business_type || "Artisan"}</p>
            </div>
          </div>
          
          {artisan.specialties && artisan.specialties.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {artisan.specialties.map((specialty: string) => (
                  <span
                    key={specialty}
                    className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {artisan.bio && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Bio</h3>
              <p>{artisan.bio}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
