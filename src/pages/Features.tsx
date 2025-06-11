
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { MainFeatures } from "@/components/features/MainFeatures";
import { AdditionalFeatures } from "@/components/features/AdditionalFeatures";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation(['common', 'navigation']);

  return (
    <PageLayout 
      title="Features | Create2Make"
      description="Discover all the powerful features that make Create2Make the perfect platform for creators and makers"
    >
      <PageHeader 
        title={t('navigation:main.features')}
        subtitle={t('common:features.subtitle')}
      />
      <MainFeatures />
      <AdditionalFeatures />
    </PageLayout>
  );
};

export default Features;
