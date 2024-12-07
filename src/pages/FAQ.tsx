import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">
          Frequently Asked Questions
        </h1>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;