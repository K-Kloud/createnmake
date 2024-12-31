import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="bg-card/30 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary hover:brightness-125 transition-all duration-300 rounded-lg">OpenT</h3>
            <p className="text-sm text-gray-400">
              Create stunning AI-generated images with our cutting-edge technology.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Button variant="link" onClick={() => navigate("/features")}>Features</Button>
              </li>
              <li>
                <Button variant="link" onClick={() => navigate("/faq")}>FAQ</Button>
              </li>
              <li>
                <Button variant="link" onClick={() => navigate("/contact")}>Contact</Button>
              </li>
              <li>
                <Button variant="link" onClick={() => navigate("/testimonials")}>Testimonials</Button>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <p className="text-sm text-gray-400">
              Email: support@openteknologies.com<br />
              Phone: +447438306305<br />
              Address: Castleford, West Yorkshire
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Follow Us</h4>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          © 2024 OpenT. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
