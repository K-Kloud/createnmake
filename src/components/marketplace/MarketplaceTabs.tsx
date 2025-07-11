
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const MarketplaceTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'explore';
  const { t } = useTranslation('marketplace');

  const handleTabChange = (value: string) => {
    setSearchParams(prev => {
      prev.set('tab', value);
      return prev;
    });
  };

  return (
    <div className="mb-8">
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="explore">{t('categories.all')}</TabsTrigger>
          <TabsTrigger value="trending">{t('filters.mostPopular')}</TabsTrigger>
          <TabsTrigger value="creators">{t('product.createdBy')}</TabsTrigger>
          <TabsTrigger value="collections">{t('titles.featuredCollections')}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
