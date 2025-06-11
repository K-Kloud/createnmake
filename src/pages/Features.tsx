
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MainFeatures } from "@/components/features/MainFeatures";
import { AdditionalFeatures } from "@/components/features/AdditionalFeatures";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation(['common', 'navigation']);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container px-4 py-12 flex-grow">
        <h1 className="text-4xl font-bold mb-4 gradient-text text-center">
          {t('navigation:main.features')}
        </h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          {t('common:features.subtitle')}
        </p>
        <MainFeatures />
        <AdditionalFeatures />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
