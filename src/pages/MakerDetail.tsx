
import { useMakerData } from "@/hooks/useMakerData";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useReviewsData } from "@/hooks/useReviewsData";
import { MakerLoadingState } from "@/components/maker/MakerLoadingState";
import { MakerNotFound } from "@/components/maker/MakerNotFound";
import { ManufacturerView } from "@/components/maker/ManufacturerView";
import { ArtisanView } from "@/components/maker/ArtisanView";
import { Manufacturer, Artisan } from "@/types/maker";

const MakerDetail = () => {
  const { maker, isLoading, error, makerId, makerType } = useMakerData();
  const { data: portfolioItems } = usePortfolioData(makerId, makerType);
  const { data: reviews } = useReviewsData(makerId, makerType);

  if (isLoading) {
    return <MakerLoadingState />;
  }

  if (error || !maker) {
    return <MakerNotFound error={error} makerId={makerId} makerType={makerType} />;
  }

  if (makerType === 'manufacturer') {
    return (
      <ManufacturerView 
        manufacturer={maker as Manufacturer}
        portfolioItems={portfolioItems}
        reviews={reviews}
      />
    );
  }
  
  return <ArtisanView artisan={maker as Artisan} />;
};

export default MakerDetail;
