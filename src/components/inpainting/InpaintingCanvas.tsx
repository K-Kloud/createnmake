
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { 
  Paintbrush, 
  Eraser, 
  RotateCcw, 
  Trash2,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react';

interface InpaintingCanvasProps {
  imageUrl: string;
  onMaskChange: (maskDataUrl: string) => void;
  className?: string;
}

type Tool = 'brush' | 'eraser' | 'pan';

export const InpaintingCanvas: React.FC<InpaintingCanvasProps> = ({
  imageUrl,
  onMaskChange,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [brushSize, setBrushSize] = useState([20]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Load and draw the image
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Initialize mask canvas with transparent background
      maskCtx.globalAlpha = 0.5;
      maskCtx.fillStyle = 'rgba(255, 255, 255, 0)';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left - pan.x) * scaleX / zoom,
      y: (e.clientY - rect.top - pan.y) * scaleY / zoom
    };
  }, [pan, zoom]);

  const startDrawing = useCallback((e: React.MouseEvent) => {
    if (tool === 'pan') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    draw(coords.x, coords.y);
  }, [tool, getCanvasCoordinates]);

  const draw = useCallback((x: number, y: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    maskCtx.globalAlpha = tool === 'eraser' ? 1 : 0.5;
    maskCtx.fillStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : 'rgba(255,0,0,0.5)';
    
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize[0] / 2, 0, Math.PI * 2);
    maskCtx.fill();

    // Convert mask to data URL and notify parent
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    onMaskChange(maskDataUrl);
  }, [tool, brushSize, onMaskChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;
    const coords = getCanvasCoordinates(e);
    draw(coords.x, coords.y);
  }, [isDrawing, isPanning, lastPanPoint, getCanvasCoordinates, draw]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setIsPanning(false);
  }, []);

  const clearMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    onMaskChange('');
  }, [onMaskChange]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.1, Math.min(5, newZoom));
    });
  }, []);

  return (
    <div className={cn("relative border rounded-lg overflow-hidden bg-gray-100", className)}>
      {/* Tools */}
      <div className="absolute top-2 left-2 z-10 flex gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2">
        <Button
          variant={tool === 'brush' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('brush')}
        >
          <Paintbrush className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === 'eraser' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('eraser')}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === 'pan' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('pan')}
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2">
        <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={clearMask}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Brush size control */}
      {tool !== 'pan' && (
        <div className="absolute bottom-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
          <div className="text-sm font-medium mb-2">
            {tool === 'brush' ? 'Brush' : 'Eraser'} Size: {brushSize[0]}px
          </div>
          <Slider
            value={brushSize}
            onValueChange={setBrushSize}
            max={100}
            min={5}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Canvas container */}
      <div 
        ref={containerRef}
        className="relative w-full h-[500px] overflow-hidden cursor-crosshair"
        style={{
          cursor: tool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair'
        }}
      >
        {/* Base image canvas */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        />
        
        {/* Mask overlay canvas */}
        <canvas
          ref={maskCanvasRef}
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};
