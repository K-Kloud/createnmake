
import { Wand2, Zap, Shield, Sparkles } from "lucide-react";
import { MainFeatureCard } from "./MainFeatureCard";
import { useTranslation } from "react-i18next";

export const MainFeatures = () => {
  const { t } = useTranslation('common');

  const mainFeatures = [
    {
      icon: Wand2,
      title: t('features.main.advancedAI.title'),
      description: t('features.main.advancedAI.description'),
      steps: t('features.main.advancedAI.steps', { returnObjects: true }) as string[]
    },
    {
      icon: Zap,
      title: t('features.main.lightningFast.title'),
      description: t('features.main.lightningFast.description'),
      steps: t('features.main.lightningFast.steps', { returnObjects: true }) as string[]
    },
    {
      icon: Shield,
      title: t('features.main.secure.title'),
      description: t('features.main.secure.description'),
      steps: t('features.main.secure.steps', { returnObjects: true }) as string[]
    },
    {
      icon: Sparkles,
      title: t('features.main.styleVariety.title'),
      description: t('features.main.styleVariety.description'),
      steps: t('features.main.styleVariety.steps', { returnObjects: true }) as string[]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {mainFeatures.map((feature, index) => (
        <MainFeatureCard key={index} {...feature} />
      ))}
    </div>
  );
};
