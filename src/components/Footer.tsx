import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Github, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
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
        { title: "Pricing", href: "/subscription" },
      ],
    },
    {
      title: "Community",
      links: [
        { title: "Testimonials", href: "/testimonials" },
        { title: "FAQ", href: "/faq" },
        { title: "Contact", href: "/contact" },
        ...(session?.user ? [{ title: "Dashboard", href: "/dashboard" }] : []),
      ],
    },
    {
      title: "Professional",
      links: session?.user
        ? [
            { title: "CRM", href: "/crm" },
            { title: "Creator Tools", href: "/creator" },
            { title: "Artisan Hub", href: "/artisan" },
            { title: "Manufacturing", href: "/manufacturer" },
          ]
        : [
            { title: "For Creators", href: "/creator/onboarding" },
            { title: "For Artisans", href: "/artisan/onboarding" },
            { title: "For Manufacturers", href: "/manufacturer/onboarding" },
          ],
    },
    {
      title: "Account",
      links: session?.user
        ? [
            { title: "My Designs", href: "/designs" },
            { title: "Orders", href: "/orders" },
            { title: "Notifications", href: "/notifications" },
            { title: "Settings", href: "/settings" },
          ]
        : [
            { title: "Sign In", href: "/auth" },
            { title: "Sign Up", href: "/auth" },
          ],
    },
  ];

  const socials = [
    { Icon: Twitter, href: "https://twitter.com/openteknologies", label: "Twitter" },
    { Icon: Instagram, href: "https://instagram.com/openteknologies", label: "Instagram" },
    { Icon: Linkedin, href: "https://linkedin.com/company/openteknologies", label: "LinkedIn" },
    { Icon: Github, href: "https://github.com/openteknologies", label: "GitHub" },
  ];

  return (
    <footer className="bg-card/40 border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Brand row */}
        <div className="grid lg:grid-cols-[1.2fr_3fr] gap-12 mb-12 pb-12 border-b border-border/30">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 bg-primary" aria-hidden />
              <span className="font-mono text-sm tracking-[0.2em] uppercase">
                openteknologies
              </span>
            </div>
            <p className="text-body-small text-muted-foreground max-w-xs mb-6">
              AI-powered fashion design and manufacturing platform. Design,
              create, and ship at scale.
            </p>
            <div className="flex gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h5 className="text-label mb-4">{section.title}</h5>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-metadata text-muted-foreground">
            <span>© 2025 OPENTEKNOLOGIES LTD</span>
            <span className="hidden sm:inline-block w-px h-3 bg-border" />
            <span className="hidden sm:inline-block">BUILD 2.0.0</span>
          </div>
          <div className="flex space-x-6">
            <Link
              to="/legal/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/legal/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
