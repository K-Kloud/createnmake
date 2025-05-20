
interface ZoomIndicatorProps {
  zoomLevel: number;
  isVisible: boolean;
}

export const ZoomIndicator = ({ zoomLevel, isVisible }: ZoomIndicatorProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
      {zoomLevel.toFixed(1)}x zoom
    </div>
  );
};
