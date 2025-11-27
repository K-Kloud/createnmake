import { Link } from "react-router-dom";
import { Shield, FileText, Lock, AlertCircle } from "lucide-react";

export const LegalFooter = () => {
  return (
    <footer className="border-t border-ghost-white/10 bg-void-black/50 backdrop-blur-xl mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-ghost-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-acid-lime" aria-hidden="true" />
              LEGAL
            </h3>
            <nav aria-label="Legal links">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/legal/terms"
                    className="text-slate-400 hover:text-acid-lime transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-3 w-3" aria-hidden="true" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/privacy"
                    className="text-slate-400 hover:text-acid-lime transition-colors flex items-center gap-2"
                  >
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/cookies"
                    className="text-slate-400 hover:text-acid-lime transition-colors flex items-center gap-2"
                  >
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Trust Signals */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-ghost-white">
              SECURITY
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="h-4 w-4 text-green-400" aria-hidden="true" />
                <span className="text-xs">SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Lock className="h-4 w-4 text-green-400" aria-hidden="true" />
                <span className="text-xs">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="h-4 w-4 text-green-400" aria-hidden="true" />
                <span className="text-xs">PCI DSS Certified</span>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-ghost-white">
              COMPANY
            </h3>
            <div className="text-sm text-slate-400 space-y-2">
              <p>Create2Make Platform</p>
              <p>AI-Powered Fashion Design</p>
              <p className="text-xs">© {new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-ghost-white">
              SUPPORT
            </h3>
            <div className="text-sm text-slate-400 space-y-2">
              <p>
                <a href="mailto:support@create2make.com" className="hover:text-acid-lime transition-colors">
                  support@create2make.com
                </a>
              </p>
              <p>
                <Link to="/contact" className="hover:text-acid-lime transition-colors">
                  Contact Form
                </Link>
              </p>
              <p>
                <Link to="/faq" className="hover:text-acid-lime transition-colors">
                  FAQ & Help Center
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-ghost-white/10">
          <p className="text-center text-xs text-slate-500 font-mono">
            By using this platform, you agree to our Terms of Service and Privacy Policy.
            <br />
            All designs and intellectual property remain with their respective creators.
          </p>
        </div>
      </div>
    </footer>
  );
};
