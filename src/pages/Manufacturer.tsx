import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ManufacturerCard } from "@/components/manufacturer/ManufacturerCard";

// Move manufacturers data to a separate file to reduce file size
import { manufacturers } from "@/data/manufacturers";

const Manufacturer = () => {
  const selectedImage = localStorage.getItem('selectedManufacturerImage');
  const imageDetails = selectedImage ? JSON.parse(selectedImage) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-24">
        <h1 className="text-4xl font-bold mb-8 gradient-text">
          Our Manufacturers
        </h1>
        
        {imageDetails && (
          <div className="mb-8 p-4 glass-card">
            <h2 className="text-xl font-semibold mb-4">Selected Design</h2>
            <div className="flex items-center gap-4">
              <img
                src={imageDetails.url}
                alt={imageDetails.prompt}
                className="w-32 h-32 object-cover rounded"
              />
              <div>
                <p className="text-sm text-muted-foreground">Design ID: {imageDetails.id}</p>
                <p className="mt-2">{imageDetails.prompt}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {manufacturers.map((manufacturer) => (
            <ManufacturerCard
              key={manufacturer.id}
              {...manufacturer}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Manufacturer;