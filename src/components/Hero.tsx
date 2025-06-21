import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
export const Hero = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation('common');
  return <div className="min-h-[70vh] flex items-center justify-center">
      <div className="container px-4 py-16 text-center">
        <h1 className="text-5xl mb-6 text-primary hover:brightness-125 hover:shadow-[0_0_15px_rgba(0,255,157,0.5)] transition-all duration-300 rounded-lg md:text-7xl font-bold">
          {t('hero.title')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-primary hover:bg-primary-hover text-lg" onClick={() => document.querySelector(".image-generator")?.scrollIntoView({
          behavior: "smooth"
        })}>
            {t('buttons.startCreating')}
          </Button>
          <Button size="lg" variant="outline" className="text-lg" onClick={() => navigate("/marketplace")}>
            {t('buttons.viewOpenMarket')}
          </Button>
          <Button size="lg" variant="ghost" className="text-lg group" onClick={() => navigate("/features")}>
            {t('buttons.exploreFeatures')}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>;
};