
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ManufacturerHeader } from "@/components/manufacturer/ManufacturerHeader";
import { PortfolioSection } from "./PortfolioSection";
import { ReviewsSection } from "./ReviewsSection";
import { Manufacturer } from "@/types/maker";

interface ManufacturerViewProps {
  manufacturer: Manufacturer;
  portfolioItems?: any[];
  reviews?: any[];
}

export const ManufacturerView = ({ manufacturer, portfolioItems, reviews }: ManufacturerViewProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mb-8">
          <ManufacturerHeader 
            name={manufacturer.business_name} 
            type={manufacturer.business_type}
            image="/placeholder.svg"
          />
          <CardContent>
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">About {manufacturer.business_name}</h2>
              <p className="text-muted-foreground">
                {manufacturer.business_type} based in {manufacturer.address || 'Location not specified'}
              </p>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {manufacturer.specialties?.map((specialty: string) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Contact</h3>
                <p>Email: {manufacturer.contact_email}</p>
                {manufacturer.phone && <p>Phone: {manufacturer.phone}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <PortfolioSection portfolioItems={portfolioItems} />
        <ReviewsSection reviews={reviews} />
      </main>
      <Footer />
    </div>
  );
};
