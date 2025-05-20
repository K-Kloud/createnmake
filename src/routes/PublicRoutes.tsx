
import { Route, Fragment } from "react-router-dom";

// Pages
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Testimonials from "@/pages/Testimonials";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Marketplace from "@/pages/Marketplace";

export const PublicRoutes = () => {
  return (
    <Fragment>
      <Route path="/" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/testimonials" element={<Testimonials />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/marketplace" element={<Marketplace />} />
    </Fragment>
  );
};
