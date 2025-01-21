import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="container px-4 py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-primary hover:brightness-125 hover:shadow-[0_0_15px_rgba(0,255,157,0.5)] transition-all duration-300 rounded-lg">
          Create-2-Make with AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Transform your imaginary visual creations into reality using our Advanced Create-2-Make AI platform. 
          Start creating your unique items and get them delivered to your doorstep.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary-hover text-lg"
            onClick={() => document.querySelector(".image-generator")?.scrollIntoView({ behavior: "smooth" })}
          >
            Start Creating
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg"
            onClick={() => navigate("/marketplace")}
          >
            View OpenMarket
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-lg group"
            onClick={() => navigate("/features")}
          >
            Explore Features
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};