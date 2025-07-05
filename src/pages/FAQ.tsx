import { MainLayout } from "@/components/layouts/MainLayout";
import { DynamicContent } from "@/components/dynamic/DynamicContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  // Fallback FAQ data in case dynamic content is not available
  const fallbackFaqs = [
    {
      question: "What is OpenT?",
      answer: "OpenT is an AI-powered image generation platform that allows you to create stunning visuals using advanced machine learning technology.",
    },
    {
      question: "How does the credit system work?",
      answer: "Each image generation costs 1 credit. You can purchase credits in bundles, and some credits are provided free with your monthly subscription.",
    },
    {
      question: "Can I use the generated images commercially?",
      answer: "Yes, all images generated through OpenT come with a commercial license. You own full rights to your creations.",
    },
    {
      question: "What image styles are available?",
      answer: "We offer various styles including realistic, anime, digital art, oil painting, watercolor, sketch, cyberpunk, and abstract.",
    },
  ];

  return (
    <MainLayout
      seo={{
        title: "Frequently Asked Questions",
        description: "Find answers to common questions about our AI-powered image generation platform.",
        canonicalUrl: `${window.location.origin}/faq`,
        keywords: ["FAQ", "questions", "help", "support", "AI", "image generation"]
      }}
    >
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">
          Frequently Asked Questions
        </h1>
        
        {/* Try to load dynamic content first */}
        <DynamicContent blockKey="faq_section" className="mb-8" />
        
        {/* Fallback static content */}
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {fallbackFaqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </MainLayout>
  );
};

export default FAQ;