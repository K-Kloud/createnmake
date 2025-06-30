
import { MainLayout } from "@/components/layouts/MainLayout";
import { EarningsPanel } from "@/components/dashboard/EarningsPanel";
import { useTranslation } from "react-i18next";

const Earnings = () => {
  const { t } = useTranslation(['common', 'dashboard']);

  return (
    <MainLayout
      seo={{
        title: "Earnings | openteknologies",
        description: "Track your earnings and financial performance"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard:earnings.title', 'Earnings')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard:earnings.description', 'Track your earnings and financial performance')}
          </p>
        </div>
        
        <EarningsPanel />
      </div>
    </MainLayout>
  );
};

export default Earnings;
