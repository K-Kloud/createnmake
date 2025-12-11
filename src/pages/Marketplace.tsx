
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Typography } from "@/components/ui/responsive-text";
import { useTranslation } from "react-i18next";
import { TechnicalControlDeck } from "@/components/marketplace/TechnicalControlDeck";
import { IndustrialProductCard } from "@/components/marketplace/IndustrialProductCard";
import { useMarketplace } from "@/components/marketplace/useMarketplace";
import { useState } from "react";
import { useMarketplaceFilters } from "@/components/marketplace/hooks/useMarketplaceFilters";
import { ProductDetail } from "@/components/marketplace/ProductDetail";
import { GalleryImage } from "@/types/gallery";
import { DataPointIcon } from "@/components/ui/fashion-icons";
import { TechnicalFeaturedCollections } from "@/components/marketplace/TechnicalFeaturedCollections";
import { TechnicalTabs } from "@/components/marketplace/TechnicalTabs";

const Marketplace = () => {
  const { t } = useTranslation(['marketplace', 'navigation']);
  const {
    session,
    images,
    isLoading,
    handleLike,
    handleView,
  } = useMarketplace();

  const [selectedProduct, setSelectedProduct] = useState<GalleryImage | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredAndSortedImages
  } = useMarketplaceFilters(
    images?.pages?.flatMap(page => page) || [],
    session
  );

  const handleProductClick = (product: GalleryImage) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
    handleView(product.id);
  };

  const handleProductShare = (productId: number) => {
    const productUrl = `${window.location.origin}/marketplace?product=${productId}`;
    navigator.clipboard.writeText(productUrl);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Technical Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Header />
      
      <div className="container px-4 py-12 flex-grow relative">
        {/* Archive Header */}
        <div className="mb-12 text-center space-y-4 animate-fade-in">
          <Typography variant="h1" className="gradient-text glow-text animate-scale-in">
            Marketplace
          </Typography>
          
          <Typography variant="body-large" color="muted" className="max-w-2xl mx-auto">
            Discover unique AI-generated designs from talented creators worldwide
          </Typography>
        </div>

        {/* Technical Tabs */}
        <TechnicalTabs />

        {/* Featured Collections */}
        <TechnicalFeaturedCollections />

        {/* Technical Control Deck */}
        <div className="mb-8 animate-fade-in">
          <TechnicalControlDeck
            onSearch={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSortBy}
          />
        </div>

        {/* Asset Grid */}
        <div className="space-y-8 animate-fade-in">
          {isLoading && filteredAndSortedImages.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-muted/20 rounded-lg animate-pulse border border-border/30 data-stream"
                >
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-primary/10 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-primary/5 rounded w-1/2 animate-pulse delay-150" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedImages.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  {filteredAndSortedImages.length} {filteredAndSortedImages.length === 1 ? 'product' : 'products'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedImages.map((product) => (
                  <IndustrialProductCard
                    key={product.id}
                    product={product}
                    onLike={handleLike}
                    onView={handleView}
                    onClick={handleProductClick}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/20 rounded-full mb-4">
                <DataPointIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <Typography variant="h3" className="mb-2">
                No products found
              </Typography>
              <Typography variant="body" color="muted">
                Try adjusting your filters
              </Typography>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          isOpen={isProductDetailOpen}
          onClose={() => setIsProductDetailOpen(false)}
          product={selectedProduct}
          onLike={handleLike}
          onShare={handleProductShare}
        />
      )}
    </div>
  );
};

export default Marketplace;
