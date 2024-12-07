import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCustomization } from "@/components/manufacturer/ProductCustomization";
import { DeliveryForm } from "@/components/manufacturer/DeliveryForm";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Manufacturer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedImage = localStorage.getItem('selectedManufacturerImage');
    if (storedImage) {
      const imageData = JSON.parse(storedImage);
      setSelectedImage(imageData.url);
    }
  }, []);

  const handleOrder = (deliveryDetails: any) => {
    // This would connect to your order processing system
    console.log("Order placed:", { deliveryDetails, selectedImage });
    toast({
      title: "Order Placed Successfully!",
      description: "We'll notify you when your order ships.",
    });
    
    // Clear the stored image after order is placed
    localStorage.removeItem('selectedManufacturerImage');
    
    // Redirect back to gallery
    setTimeout(() => {
      navigate('/gallery');
    }, 2000);
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