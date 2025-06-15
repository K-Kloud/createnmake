
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useClickTracking } from '@/hooks/useClickTracking';

interface TrackableButtonProps extends ButtonProps {
  trackingLabel?: string;
  trackingCategory?: string;
  trackingMetadata?: any;
}

export const TrackableButton: React.FC<TrackableButtonProps> = ({
  children,
  trackingLabel,
  trackingCategory = 'button',
  trackingMetadata,
  onClick,
  ...props
}) => {
  const { trackButtonClick } = useClickTracking();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track the button click
    trackButtonClick(
      trackingLabel || (typeof children === 'string' ? children : 'button'),
      props.id,
      { category: trackingCategory, ...trackingMetadata }
    );

    // Call the original onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
};
