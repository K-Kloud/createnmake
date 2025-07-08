import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { LoadingState } from '@/components/ui/loading-state';
import { MousePointer, Eye, Activity } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  type: string;
}

export const HeatmapViewer: React.FC = () => {
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [interactionType, setInteractionType] = useState('all');
  const [isRecording, setIsRecording] = useState(true);
  
  const { useHeatmapData, trackHeatmapInteraction } = useAdvancedAnalytics();
  const { data: heatmapData, isLoading, error } = useHeatmapData(location.pathname, timeRange);

  // Track user interactions for heatmap
  useEffect(() => {
    if (!isRecording) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      const selector = getElementSelector(target);
      
      trackHeatmapInteraction.mutate({
        page_path: location.pathname,
        element_selector: selector,
        interaction_type: 'click',
        x_coordinate: event.clientX,
        y_coordinate: event.clientY,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Sample mouse movements to avoid too much data
      if (Math.random() > 0.01) return;
      
      const target = event.target as Element;
      const selector = getElementSelector(target);
      
      trackHeatmapInteraction.mutate({
        page_path: location.pathname,
        element_selector: selector,
        interaction_type: 'hover',
        x_coordinate: event.clientX,
        y_coordinate: event.clientY,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isRecording, location.pathname, trackHeatmapInteraction]);

  // Generate simple element selector
  const getElementSelector = (element: Element): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) return `.${classes[0]}`;
    }
    return element.tagName.toLowerCase();
  };

  // Render heatmap on canvas
  useEffect(() => {
    if (!heatmapData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter data by interaction type
    const filteredData = heatmapData.filter(point => 
      interactionType === 'all' || point.interaction_type === interactionType
    );

    // Group points by location and count intensity
    const pointMap = new Map<string, HeatmapPoint>();
    
    filteredData.forEach(point => {
      const key = `${Math.floor(point.x_coordinate / 20)}_${Math.floor(point.y_coordinate / 20)}`;
      const existing = pointMap.get(key);
      
      if (existing) {
        existing.intensity++;
      } else {
        pointMap.set(key, {
          x: point.x_coordinate,
          y: point.y_coordinate,
          intensity: 1,
          type: point.interaction_type,
        });
      }
    });

    // Find max intensity for normalization
    const maxIntensity = Math.max(...Array.from(pointMap.values()).map(p => p.intensity), 1);

    // Draw heatmap points
    Array.from(pointMap.values()).forEach(point => {
      const normalizedIntensity = point.intensity / maxIntensity;
      const radius = 20 + (normalizedIntensity * 30);
      
      // Create gradient
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      const alpha = normalizedIntensity * 0.6;
      const color = point.type === 'click' ? '255, 0, 0' : '0, 150, 255';
      
      gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [heatmapData, interactionType]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Interaction Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last Day</SelectItem>
                <SelectItem value="7d">Last Week</SelectItem>
                <SelectItem value="30d">Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={interactionType} onValueChange={setInteractionType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="click">Clicks</SelectItem>
                <SelectItem value="hover">Hovers</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={isRecording ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Recording
                </>
              ) : (
                <>
                  <MousePointer className="h-4 w-4 mr-1" />
                  Paused
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LoadingState
          isLoading={isLoading}
          error={error}
          loadingMessage="Loading heatmap data..."
          errorMessage="Failed to load heatmap data"
        >
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none z-10"
              style={{ width: '100%', height: '400px' }}
            />
            
            <div className="h-96 bg-gradient-to-br from-background/50 to-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Interactive Heatmap</h3>
                <p className="text-muted-foreground">
                  {heatmapData && heatmapData.length > 0
                    ? `Showing ${heatmapData.length} interactions`
                    : 'No interaction data for this page yet'
                  }
                </p>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full opacity-60" />
                <span>Clicks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full opacity-60" />
                <span>Hovers</span>
              </div>
              <div className="text-muted-foreground">
                Intensity: darker = more interactions
              </div>
            </div>
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  );
};