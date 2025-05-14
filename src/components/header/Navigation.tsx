
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="flex items-center space-x-4">
      <Button variant="ghost" asChild>
        <Link to="/marketplace">OpenMarket</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/create">Create</Link>
      </Button>
    </nav>
  );
};
