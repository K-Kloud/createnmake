
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const footerSections = [
    {
      title: "Platform",
      links: [
        { title: "Features", href: "/features" },
        { title: "Marketplace", href: "/marketplace" },
        { title: "Create", href: "/create" },
        { title: "Pricing", href: "/subscription" }
      ]
    },
    {
      title: "Community",
      links: [
        { title: "Testimonials", href: "/testimonials" },
        { title: "FAQ", href: "/faq" },
        { title: "Contact", href: "/contact" },
        ...(session?.user ? [{ title: "Dashboard", href: "/dashboard" }] : [])
      ]
    },
    {
      title: "Professional",
      links: session?.user ? [
        { title: "CRM", href: "/crm" },
        { title: "Creator Tools", href: "/creator" },
        { title: "Artisan Hub", href: "/artisan" },
        { title: "Manufacturing", href: "/manufacturer" }
      ] : [
        { title: "For Creators", href: "/creator/onboarding" },
        { title: "For Artisans", href: "/artisan/onboarding" },
        { title: "For Manufacturers", href: "/manufacturer/onboarding" }
      ]
    },
    {
      title: "Account",
      links: session?.user ? [
        { title: "My Designs", href: "/designs" },
        { title: "Orders", href: "/orders" },
        { title: "Notifications", href: "/notifications" },
        { title: "Settings", href: "/settings" }
      ] : [
        { title: "Sign In", href: "/auth" },
        { title: "Sign Up", href: "/auth" }
      ]
    }
  ];

  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © 2024 openteknologies. All rights reserved.
          </div>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
