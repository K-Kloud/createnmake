import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Palette, 
  Layers, 
  Move, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical,
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Ruler,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Undo,
  Redo,
  Save,
  Download,
  Upload,
  Settings,
  MousePointer,
  Square,
  Circle,
  Type,
  Image,
  Brush,
  Eraser
} from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'background';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  hotkey: string;
}

export const AdvancedDesignTools: React.FC = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<string | null>('layer1');
  
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'layer1',
      name: 'Background',
      type: 'background',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      rotation: 0
    },
    {
      id: 'layer2',
      name: 'Main Image',
      type: 'image',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      rotation: 0
    },
    {
      id: 'layer3',
      name: 'Text Layer',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 90,
      blendMode: 'normal',
      x: 200,
      y: 450,
      width: 300,
      height: 50,
      rotation: 0
    }
  ]);

  const tools: Tool[] = [
    { id: 'select', name: 'Select', icon: <MousePointer className="h-4 w-4" />, hotkey: 'V' },
    { id: 'move', name: 'Move', icon: <Move className="h-4 w-4" />, hotkey: 'M' },
    { id: 'rectangle', name: 'Rectangle', icon: <Square className="h-4 w-4" />, hotkey: 'R' },
    { id: 'circle', name: 'Circle', icon: <Circle className="h-4 w-4" />, hotkey: 'C' },
    { id: 'text', name: 'Text', icon: <Type className="h-4 w-4" />, hotkey: 'T' },
    { id: 'image', name: 'Image', icon: <Image className="h-4 w-4" />, hotkey: 'I' },
    { id: 'brush', name: 'Brush', icon: <Brush className="h-4 w-4" />, hotkey: 'B' },
    { id: 'eraser', name: 'Eraser', icon: <Eraser className="h-4 w-4" />, hotkey: 'E' }
  ];

  const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light', 
    'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten'
  ];

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    toast({
      title: "Tool Selected",
      description: `${tools.find(t => t.id === toolId)?.name} tool is now active`,
    });
  };

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, locked: !layer.locked }
        : layer
    ));
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
  };

  const updateLayerBlendMode = (layerId: string, blendMode: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, blendMode }
        : layer
    ));
  };

  const duplicateLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      const newLayer = {
        ...layer,
        id: `layer${Date.now()}`,
        name: `${layer.name} Copy`,
        x: layer.x + 20,
        y: layer.y + 20
      };
      setLayers(prev => [...prev, newLayer]);
    }
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length > 1) {
      setLayers(prev => prev.filter(layer => layer.id !== layerId));
      if (selectedLayer === layerId) {
        setSelectedLayer(layers[0].id);
      }
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "File Uploaded",
          description: `${file.name} has been added to the canvas`,
        });
      }
    };
    input.click();
  };

  const handleSave = () => {
    toast({
      title: "Project Saved",
      description: "Your design has been saved successfully",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your design is being exported as PNG",
    });
  };

  const selectedLayerObj = layers.find(l => l.id === selectedLayer);

  return (
    <div className="h-full flex">
      {/* Left Toolbar */}
      <div className="w-16 border-r bg-muted/20 p-2 space-y-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full h-12 p-2"
            onClick={() => handleToolSelect(tool.id)}
            title={`${tool.name} (${tool.hotkey})`}
          >
            {tool.icon}
          </Button>
        ))}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-12 border-b bg-background flex items-center px-4 gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleFileUpload}>
              <Upload className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <div className="flex items-center gap-2">
            <Button
              variant={showGrid ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={showRulers ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowRulers(!showRulers)}
            >
              <Ruler className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-20 text-center text-sm">{zoom}%</div>
            <Button variant="ghost" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Slider
              value={[zoom]}
              onValueChange={handleZoomChange}
              min={25}
              max={400}
              step={25}
              className="w-24"
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-muted/10 relative overflow-auto">
          {showRulers && (
            <>
              <div className="absolute top-0 left-20 right-0 h-5 bg-background border-b flex items-center text-xs text-muted-foreground">
                {/* Horizontal ruler marks */}
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="flex-1 border-l text-center">
                    {i * 50}
                  </div>
                ))}
              </div>
              <div className="absolute top-5 left-0 bottom-0 w-20 bg-background border-r flex flex-col text-xs text-muted-foreground">
                {/* Vertical ruler marks */}
                {Array.from({ length: 15 }, (_, i) => (
                  <div key={i} className="flex-1 border-t flex items-center justify-center">
                    {i * 50}
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div className={`${showRulers ? 'ml-20 mt-5' : ''} p-8`}>
            <div 
              className="relative bg-white shadow-lg mx-auto"
              style={{ 
                width: 800 * (zoom / 100), 
                height: 600 * (zoom / 100),
                backgroundImage: showGrid ? 'radial-gradient(circle, #ccc 1px, transparent 1px)' : undefined,
                backgroundSize: showGrid ? '20px 20px' : undefined
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full border"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 border-l bg-muted/20">
        <Tabs defaultValue="layers" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="layers" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Layers</h3>
              <Button size="sm" variant="outline">
                <Layers className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {layers.slice().reverse().map((layer) => (
                <div
                  key={layer.id}
                  className={`p-2 border rounded-lg cursor-pointer ${
                    selectedLayer === layer.id ? 'border-primary bg-primary/10' : ''
                  }`}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
                        }}
                      >
                        {layer.visible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerLock(layer.id);
                        }}
                      >
                        {layer.locked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Unlock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                      <span className="text-sm">{layer.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {layer.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateLayer(layer.id);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLayer(layer.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Opacity</span>
                        <span>{layer.opacity}%</span>
                      </div>
                      <Slider
                        value={[layer.opacity]}
                        onValueChange={(value) => updateLayerOpacity(layer.id, value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="properties" className="p-4 space-y-4">
            {selectedLayerObj && (
              <>
                <div>
                  <h3 className="font-medium mb-3">Layer Properties</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Blend Mode</label>
                      <Select
                        value={selectedLayerObj.blendMode}
                        onValueChange={(value) => updateLayerBlendMode(selectedLayerObj.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {blendModes.map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">X</label>
                        <div className="text-sm text-muted-foreground">{selectedLayerObj.x}px</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Y</label>
                        <div className="text-sm text-muted-foreground">{selectedLayerObj.y}px</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Width</label>
                        <div className="text-sm text-muted-foreground">{selectedLayerObj.width}px</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Height</label>
                        <div className="text-sm text-muted-foreground">{selectedLayerObj.height}px</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Rotation</label>
                      <div className="text-sm text-muted-foreground">{selectedLayerObj.rotation}°</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FlipHorizontal className="h-4 w-4 mr-2" />
                    Flip H
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FlipVertical className="h-4 w-4 mr-2" />
                    Flip V
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Transform
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="tools" className="p-4 space-y-4">
            <div>
              <h3 className="font-medium mb-3">Tool Settings</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Tool</CardTitle>
                  <CardDescription className="text-xs">
                    {tools.find(t => t.id === activeTool)?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Brush Size</label>
                      <Slider
                        defaultValue={[10]}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Opacity</label>
                      <Slider
                        defaultValue={[100]}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Color Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded border cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};