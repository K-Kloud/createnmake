import { Helmet } from "react-helmet";
import { MainLayout } from "@/components/layouts/MainLayout";

const Terms = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Terms of Service - OpenTeknologies</title>
        <meta name="description" content="Terms of Service for OpenTeknologies AI platform" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
          Terms of Service
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using OpenTeknologies ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              OpenTeknologies provides AI-powered image generation services, allowing users to create images 
              using artificial intelligence models. Our platform includes web-based tools, APIs, and related services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>
              To access certain features of the Service, you must register for an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mt-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete registration information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mt-4">
              <li>Generate illegal, harmful, or offensive content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Create content that impersonates others without permission</li>
              <li>Generate content for malicious purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
            <p>
              You retain ownership of content you create using our Service. However, you grant us a license to 
              store, process, and display your content as necessary to provide the Service. We reserve the right 
              to use anonymized usage data to improve our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Payment and Billing</h2>
            <p>
              Paid features are billed according to your selected plan. All payments are processed securely 
              through our payment providers. Refunds are handled according to our refund policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
              of the Service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice 
              or liability, for any reason, including without limitation if you breach the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or 
              implied, and hereby disclaim all other warranties including implied warranties of merchantability, 
              fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-4">
              Email: legal@openteknologies.com<br />
              Address: London, United Kingdom
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;