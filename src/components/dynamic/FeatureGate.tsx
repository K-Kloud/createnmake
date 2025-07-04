import React from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback = null
}) => {
  const isEnabled = useFeatureFlag(feature);

  return isEnabled ? <>{children}</> : <>{fallback}</>;
};