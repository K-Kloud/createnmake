
import { MainLayout } from "@/components/layouts/MainLayout";
import { EnhancedProductsPanel } from "@/components/dashboard/products/EnhancedProductsPanel";
import { useTranslation } from "react-i18next";

const Products = () => {
  const { t } = useTranslation(['common', 'dashboard']);

  return (
    <MainLayout
      seo={{
        title: "Products | openteknologies",
        description: "Manage your products and inventory"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard:products.title', 'Products')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard:products.description', 'Manage your products and inventory')}
          </p>
        </div>
        
        <EnhancedProductsPanel />
      </div>
    </MainLayout>
  );
};

export default Products;
