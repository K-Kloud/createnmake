import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, ChevronDown, ThumbsUp, ThumbsDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data;
    },
  });

  const { data: articles } = useQuery({
    queryKey: ["faq-articles", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("faq_articles")
        .select("*")
        .order("display_order");

      if (searchQuery) {
        query = query.or(`question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const groupedArticles = categories?.reduce((acc, category) => {
    acc[category.id] = articles?.filter((a) => a.category_id === category.id) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <section className="space-y-6" aria-labelledby="faq-heading">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="h-8 w-8 text-acid-lime" aria-hidden="true" />
          <h2 id="faq-heading" className="text-2xl font-mono uppercase tracking-widest text-ghost-white">
            FREQUENTLY_ASKED_QUESTIONS
          </h2>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Find quick answers to common questions about our platform
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-void-black border-ghost-white/10"
            aria-label="Search frequently asked questions"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {categories?.map((category) => {
          const categoryArticles = groupedArticles?.[category.id] || [];
          if (categoryArticles.length === 0) return null;

          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-3">
                {category.icon && (
                  <span className="text-2xl" role="img" aria-label={category.name}>
                    {category.icon}
                  </span>
                )}
                <h3 className="text-lg font-mono uppercase tracking-widest text-ghost-white">
                  {category.name}
                </h3>
              </div>
              {category.description && (
                <p className="text-sm text-slate-400">{category.description}</p>
              )}

              <Accordion type="single" collapsible className="space-y-2">
                {categoryArticles.map((article) => (
                  <AccordionItem
                    key={article.id}
                    value={article.id}
                    className="border border-ghost-white/10 rounded-none bg-void-black/50 px-6"
                  >
                    <AccordionTrigger
                      className="text-left hover:text-acid-lime transition-colors hover:no-underline"
                      aria-label={`Question: ${article.question}`}
                    >
                      <span className="font-semibold text-ghost-white pr-4">{article.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300 leading-relaxed space-y-4">
                      <div dangerouslySetInnerHTML={{ __html: article.answer }} />
                      <div className="flex items-center gap-4 pt-4 border-t border-ghost-white/10">
                        <p className="text-sm text-slate-400">Was this helpful?</p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-green-400"
                            aria-label="Mark as helpful"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" aria-hidden="true" />
                            {article.helpful_count}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400"
                            aria-label="Mark as not helpful"
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" aria-hidden="true" />
                            {article.not_helpful_count}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}
      </div>
    </section>
  );
};
