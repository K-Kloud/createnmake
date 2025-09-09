import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Layers, Play, Pause, Download, X, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BatchItem {
  id: string;
  prompt: string;
  itemType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

interface BatchProcessingProps {
  className?: string;
  onBatchGenerate?: (items: BatchItem[]) => Promise<void>;
}

export const BatchProcessing: React.FC<BatchProcessingProps> = ({
  className = '',
  onBatchGenerate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [newPrompt, setNewPrompt] = useState('');
  const [newItemType, setNewItemType] = useState('basic-t-shirt');
  const [batchSettings, setBatchSettings] = useState({
    concurrent: false,
    delay: 2000,
    retryFailed: true,
    downloadAll: false
  });
  const { toast } = useToast();

  const addBatchItem = () => {
    if (!newPrompt.trim()) return;
    
    const newItem: BatchItem = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt: newPrompt.trim(),
      itemType: newItemType,
      status: 'pending'
    };
    
    setBatchItems(prev => [...prev, newItem]);
    setNewPrompt('');
    toast({
      title: "Item added to batch",
      description: `Added "${newPrompt.slice(0, 30)}..." to processing queue`
    });
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const clearBatch = () => {
    setBatchItems([]);
    setCurrentItemIndex(0);
  };

  const startBatchProcessing = async () => {
    if (batchItems.length === 0) {
      toast({
        title: "No items to process",
        description: "Add some prompts to the batch first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentItemIndex(0);
    
    try {
      if (onBatchGenerate) {
        await onBatchGenerate(batchItems);
      } else {
        // Simulate batch processing for demo
        for (let i = 0; i < batchItems.length; i++) {
          setCurrentItemIndex(i);
          setBatchItems(prev => prev.map((item, index) => 
            index === i ? { ...item, status: 'processing' } : item
          ));
          
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, batchSettings.delay));
          
          // Simulate success/failure
          const success = Math.random() > 0.2; // 80% success rate
          
          setBatchItems(prev => prev.map((item, index) => 
            index === i ? { 
              ...item, 
              status: success ? 'completed' : 'failed',
              error: success ? undefined : 'Generation failed'
            } : item
          ));
        }
      }
      
      toast({
        title: "Batch processing completed",
        description: `Processed ${batchItems.length} items`
      });
    } catch (error) {
      toast({
        title: "Batch processing failed",
        description: "Some items may have failed to process",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const stopBatchProcessing = () => {
    setIsProcessing(false);
    toast({
      title: "Batch processing stopped",
      description: "Processing has been cancelled"
    });
  };

  const completedItems = batchItems.filter(item => item.status === 'completed');
  const failedItems = batchItems.filter(item => item.status === 'failed');
  const progress = batchItems.length > 0 ? (currentItemIndex / batchItems.length) * 100 : 0;

  const itemTypes = [
    { value: 'basic-t-shirt', label: 'Basic T-Shirt' },
    { value: 'dress', label: 'Dress' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'jacket', label: 'Jacket' }
  ];

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Batch Processing
            {batchItems.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {batchItems.length} items
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {completedItems.length > 0 && (
              <Badge variant="default" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {completedItems.length}
              </Badge>
            )}
            {failedItems.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                {failedItems.length}
              </Badge>
            )}
          </div>
        </CardTitle>
        
        {isProcessing && (
          <Progress value={progress} className="h-1" />
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter prompt for batch item..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && addBatchItem()}
                />
                <Select value={newItemType} onValueChange={setNewItemType}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-xs">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={addBatchItem}
                  disabled={!newPrompt.trim()}
                  className="h-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {batchItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Batch Queue ({batchItems.length})</Label>
                  <div className="flex gap-1">
                    {!isProcessing ? (
                      <Button
                        size="sm"
                        onClick={startBatchProcessing}
                        disabled={batchItems.length === 0}
                        className="h-6 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={stopBatchProcessing}
                        className="h-6 text-xs"
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearBatch}
                      disabled={isProcessing}
                      className="h-6 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {batchItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded border text-xs flex items-center justify-between ${
                        item.status === 'processing' ? 'border-primary bg-primary/5' :
                        item.status === 'completed' ? 'border-green-500/50 bg-green-500/5' :
                        item.status === 'failed' ? 'border-red-500/50 bg-red-500/5' :
                        'border-border/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {item.prompt}
                        </div>
                        <div className="text-muted-foreground">
                          {item.itemType} • {item.status}
                          {item.error && ` • ${item.error}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {item.status === 'completed' && (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        )}
                        {item.status === 'failed' && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                        {item.status === 'processing' && (
                          <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                        {!isProcessing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeBatchItem(item.id)}
                            className="h-4 w-4 p-0"
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Switch
                  id="batch-concurrent"
                  checked={batchSettings.concurrent}
                  onCheckedChange={(checked) => 
                    setBatchSettings(prev => ({ ...prev, concurrent: checked }))
                  }
                  disabled={isProcessing}
                />
                <Label htmlFor="batch-concurrent">Concurrent processing</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="batch-retry"
                  checked={batchSettings.retryFailed}
                  onCheckedChange={(checked) => 
                    setBatchSettings(prev => ({ ...prev, retryFailed: checked }))
                  }
                  disabled={isProcessing}
                />
                <Label htmlFor="batch-retry">Retry failed items</Label>
              </div>
            </div>

            {completedItems.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs"
                onClick={() => {
                  toast({
                    title: "Download started",
                    description: `Downloading ${completedItems.length} images`
                  });
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Download All Completed ({completedItems.length})
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};