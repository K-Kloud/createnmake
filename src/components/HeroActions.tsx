
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HeroActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in delay-300">
      <Button 
        data-tour="create-button"
        size="lg" 
        className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all" 
        onClick={() => document.querySelector(".image-generator")?.scrollIntoView({
          behavior: "smooth"
        })}
      >
        {t('buttons.startCreating')}
      </Button>
      <Button 
        size="lg" 
        variant="outline" 
        className="w-full sm:w-auto text-lg font-semibold border-2 hover:bg-accent/10 hover:border-accent hover:scale-105 transition-all" 
        onClick={() => navigate("/marketplace")}
      >
        {t('buttons.viewOpenMarket')}
      </Button>
      <Button 
        size="lg" 
        variant="ghost" 
        className="w-full sm:w-auto text-lg font-semibold group hover:bg-muted hover:scale-105 transition-all" 
        onClick={() => navigate("/features")}
      >
        {t('buttons.exploreFeatures')}
        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};
