
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HeroActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button 
        data-tour="create-button"
        size="lg" 
        className="bg-primary hover:bg-primary-hover text-lg" 
        onClick={() => document.querySelector(".image-generator")?.scrollIntoView({
          behavior: "smooth"
        })}
      >
        {t('buttons.startCreating')}
      </Button>
      <Button 
        size="lg" 
        variant="outline" 
        className="text-lg" 
        onClick={() => navigate("/marketplace")}
      >
        {t('buttons.viewOpenMarket')}
      </Button>
      <Button 
        size="lg" 
        variant="ghost" 
        className="text-lg group" 
        onClick={() => navigate("/features")}
      >
        {t('buttons.exploreFeatures')}
        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};
