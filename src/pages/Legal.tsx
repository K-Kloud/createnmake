import { useParams, Link } from "react-router-dom";
import { Shield, FileText, Lock, AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const legalContent = {
  terms: {
    title: "Terms of Service",
    icon: FileText,
    lastUpdated: "December 2024",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content: "By accessing and using Create2Make, you accept and agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.",
      },
      {
        heading: "2. User Accounts",
        content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.",
      },
      {
        heading: "3. Intellectual Property",
        content: "All designs, images, and content generated through our platform remain the intellectual property of the creator. By using our service, you grant us a license to display and distribute your content as necessary to operate the platform.",
      },
      {
        heading: "4. Prohibited Uses",
        content: "You may not use our service for any illegal purposes, to infringe on others' intellectual property rights, or to transmit harmful code or malicious software.",
      },
      {
        heading: "5. Limitation of Liability",
        content: "Create2Make shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: Lock,
    lastUpdated: "December 2024",
    sections: [
      {
        heading: "1. Information We Collect",
        content: "We collect information you provide directly to us, including account information, design preferences, and usage data. We also collect information automatically through cookies and similar technologies.",
      },
      {
        heading: "2. How We Use Your Information",
        content: "We use collected information to provide and improve our services, personalize your experience, communicate with you, and comply with legal obligations.",
      },
      {
        heading: "3. Data Sharing",
        content: "We do not sell your personal information. We may share data with service providers who assist in our operations, and as required by law.",
      },
      {
        heading: "4. Data Security",
        content: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.",
      },
      {
        heading: "5. Your Rights",
        content: "You have the right to access, correct, or delete your personal data. You may also object to processing and request data portability where applicable under GDPR.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    icon: AlertCircle,
    lastUpdated: "December 2024",
    sections: [
      {
        heading: "1. What Are Cookies",
        content: "Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and analyze how our service is used.",
      },
      {
        heading: "2. Types of Cookies We Use",
        content: "Essential cookies (required for basic functionality), Analytics cookies (to understand usage patterns), and Preference cookies (to remember your settings and preferences).",
      },
      {
        heading: "3. Managing Cookies",
        content: "You can control cookies through your browser settings. Note that disabling certain cookies may limit your ability to use some features of our service.",
      },
      {
        heading: "4. Third-Party Cookies",
        content: "We may use third-party services like analytics providers that also set cookies. These are subject to the respective privacy policies of these external services.",
      },
    ],
  },
};

const Legal = () => {
  const { page = "terms" } = useParams<{ page: string }>();
  const content = legalContent[page as keyof typeof legalContent] || legalContent.terms;
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Button
            variant="ghost"
            className="mb-8 text-muted-foreground hover:text-primary"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Back to Home
          </Button>
        </Link>

        <article className="border border-border rounded-none bg-card/50 backdrop-blur-xl p-8 md:p-12 space-y-8">
          <header className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 border border-primary/20 rounded-none bg-primary/5">
                <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-3xl font-mono uppercase tracking-widest text-foreground">
                  {content.title}
                </h1>
                <p className="text-sm text-muted-foreground font-mono mt-2">
                  Last Updated: {content.lastUpdated}
                </p>
              </div>
            </div>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            {content.sections.map((section, index) => (
              <section key={index} className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>

          <footer className="pt-8 border-t border-border">
            <div className="flex items-start gap-3 p-4 border border-primary/20 rounded-none bg-primary/5">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-2">Questions or Concerns?</p>
                <p>
                  If you have any questions about this {content.title.toLowerCase()}, please contact us at{" "}
                  <a href="mailto:legal@openteknologies.com" className="text-primary hover:underline">
                    legal@openteknologies.com
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Links */}
        <nav className="mt-8" aria-label="Related legal documents">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(legalContent).map(([key, doc]) => {
              const DocIcon = doc.icon;
              return (
                <Link
                  key={key}
                  to={`/legal/${key}`}
                  className={`p-4 border rounded-none transition-colors ${
                    key === page
                      ? "border-primary/30 bg-primary/10"
                      : "border-border bg-card/30 hover:border-primary/20"
                  }`}
                  aria-current={key === page ? "page" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <DocIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="text-sm font-mono uppercase tracking-wider text-foreground">
                      {doc.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Legal;
