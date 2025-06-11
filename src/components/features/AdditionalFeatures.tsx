
import {
  Upload,
  Share2,
  Download,
  PaintBucket,
  Settings,
  Users,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import { AdditionalFeatureCard } from "./AdditionalFeatureCard";
import { useTranslation } from "react-i18next";

export const AdditionalFeatures = () => {
  const { t } = useTranslation('common');

  const additionalFeatures = [
    {
      icon: Upload,
      title: t('features.additional.referenceUpload.title'),
      description: t('features.additional.referenceUpload.description')
    },
    {
      icon: Share2,
      title: t('features.additional.easySharing.title'),
      description: t('features.additional.easySharing.description')
    },
    {
      icon: Download,
      title: t('features.additional.quickDownloads.title'),
      description: t('features.additional.quickDownloads.description')
    },
    {
      icon: PaintBucket,
      title: t('features.additional.colorControl.title'),
      description: t('features.additional.colorControl.description')
    },
    {
      icon: Settings,
      title: t('features.additional.advancedSettings.title'),
      description: t('features.additional.advancedSettings.description')
    },
    {
      icon: Users,
      title: t('features.additional.artisanNetwork.title'),
      description: t('features.additional.artisanNetwork.description')
    },
    {
      icon: ShoppingBag,
      title: t('features.additional.marketplace.title'),
      description: t('features.additional.marketplace.description')
    },
    {
      icon: MessageSquare,
      title: t('features.additional.community.title'),
      description: t('features.additional.community.description')
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-center gradient-text">{t('features.additionalFeaturesTitle')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {additionalFeatures.map((feature, index) => (
          <AdditionalFeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};
