import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center space-x-4">
      <Button variant="ghost" onClick={() => navigate("/marketplace")}>
        OpenMarket
      </Button>
      <Button variant="ghost" onClick={() => navigate("/create")}>
        Create
      </Button>
    </nav>
  );
};