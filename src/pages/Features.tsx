
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MainFeatures } from "@/components/features/MainFeatures";
import { AdditionalFeatures } from "@/components/features/AdditionalFeatures";
import { Typography } from "@/components/ui/responsive-text";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation(['common', 'navigation']);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container px-4 py-12 flex-grow">
        <Typography variant="h1" color="gradient" className="mb-4 text-center">
          {t('navigation:main.features')}
        </Typography>
        <Typography variant="body-large" color="muted" className="text-center mb-12 max-w-2xl mx-auto">
          {t('common:features.subtitle')}
        </Typography>
        <MainFeatures />
        <AdditionalFeatures />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
