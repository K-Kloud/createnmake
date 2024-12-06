import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container px-4 py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text animate-float">
          Create Amazing Art with AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Transform your ideas into stunning visuals using our advanced AI image generation platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary-hover text-lg"
            onClick={() => navigate("/create")}
          >
            Start Creating
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg"
            onClick={() => navigate("/gallery")}
          >
            View Gallery
          </Button>
        </div>
      </div>
    </div>
  );
};