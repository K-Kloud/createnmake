import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const quickLinks = [
    { label: "Home", href: "/", Icon: Home },
    { label: "Marketplace", href: "/marketplace", Icon: Compass },
    { label: "Create", href: "/create", Icon: Search },
  ];

  return (
    <MainLayout
      seo={{
        title: "Page Not Found | 404",
        description: "The page you are looking for does not exist or has been moved.",
      }}
    >
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {/* Terminal-style frame */}
          <div className="relative border border-border bg-card/40 p-8 md:p-12">
            <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-primary" />

            {/* Status line */}
            <div className="flex items-center gap-2 mb-6 text-metadata text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
              <span>STATUS 404 · RESOURCE NOT FOUND</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-mono font-bold text-primary acid-text-glow mb-6 tracking-tighter">
              404
            </h1>

            <div className="space-y-2 mb-8">
              <p className="font-mono text-xs text-muted-foreground">
                $ GET {location.pathname}
              </p>
              <p className="text-foreground text-lg">
                The page you&apos;re looking for doesn&apos;t exist or has moved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="font-mono text-xs uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button asChild className="font-mono text-xs uppercase tracking-wider">
                <Link to="/">Return Home</Link>
              </Button>
            </div>

            {/* Quick links */}
            <div className="pt-6 border-t border-border/40">
              <div className="text-label mb-3">QUICK NAVIGATION</div>
              <div className="grid grid-cols-3 gap-px bg-border/40">
                {quickLinks.map(({ label, href, Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className="flex flex-col items-center gap-2 p-4 bg-background hover:bg-card transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
