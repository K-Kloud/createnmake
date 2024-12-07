import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCustomization } from "@/components/manufacturer/ProductCustomization";
import { DeliveryForm } from "@/components/manufacturer/DeliveryForm";
import { useToast } from "@/components/ui/use-toast";

const Manufacturer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOrder = (deliveryDetails: any) => {
    // This would connect to your order processing system
    console.log("Order placed:", { deliveryDetails, selectedImage });
    toast({
      title: "Order Placed Successfully!",
      description: "We'll notify you when your order ships.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-24">
        <h1 className="text-4xl font-bold mb-8 gradient-text">
          Manufacture Your Design
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          <ProductCustomization
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
          />
          <DeliveryForm onSubmit={handleOrder} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Manufacturer;