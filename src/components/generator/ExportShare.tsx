import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Share2, 
  Download, 
  Copy, 
  Mail, 
  FileText, 
  Image as ImageIcon,
  Link,
  QrCode,
  Palette
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { GenerationRecord } from '@/hooks/useGenerationHistory';

interface ExportShareProps {
  generation: GenerationRecord;
  className?: string;
}

export const ExportShare: React.FC<ExportShareProps> = ({
  generation,
  className = ''
}) => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState(generation.prompt);
  const [isExporting, setIsExporting] = useState(false);

  const downloadImage = async (format: 'png' | 'jpg' = 'png') => {
    try {
      setIsExporting(true);
      
      const response = await fetch(generation.imageUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fashion-generation-${generation.id.slice(0, 8)}.${format}`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded",
        description: `Image saved as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download image",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    try {
      setIsExporting(true);
      
      // Dynamic import for PDF generation
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(shareTitle || 'Fashion Generation', 20, 30);
      
      // Add prompt
      pdf.setFontSize(12);
      pdf.text('Prompt:', 20, 50);
      const splitPrompt = pdf.splitTextToSize(generation.prompt, 170);
      pdf.text(splitPrompt, 20, 60);
      
      // Add metadata
      const yOffset = 60 + (splitPrompt.length * 5);
      pdf.text(`Item Type: ${generation.itemType}`, 20, yOffset + 20);
      pdf.text(`Provider: ${generation.provider}`, 20, yOffset + 30);
      pdf.text(`Generated: ${new Date(generation.createdAt).toLocaleDateString()}`, 20, yOffset + 40);
      
      if (generation.rating) {
        pdf.text(`Rating: ${'★'.repeat(generation.rating)}${'☆'.repeat(5 - generation.rating)}`, 20, yOffset + 50);
      }
      
      // Add image if possible
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = generation.imageUrl;
        });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        pdf.addImage(imgData, 'JPEG', 20, yOffset + 60, 80, 80);
      } catch (error) {
        console.warn('Could not add image to PDF:', error);
      }
      
      pdf.save(`fashion-generation-${generation.id.slice(0, 8)}.pdf`);
      
      toast({
        title: "Exported",
        description: "PDF report generated successfully"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to generate PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${label} copied to clipboard`
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const copyImageAsDataUrl = async () => {
    try {
      const response = await fetch(generation.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        copyToClipboard(reader.result as string, 'Image data URL');
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy image data",
        variant: "destructive"
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareTitle || 'Fashion Generation');
    const body = encodeURIComponent(
      `${shareDescription}\n\nGenerated with: ${generation.provider}\nItem Type: ${generation.itemType}\n\nView image: ${generation.imageUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateShareableLink = () => {
    const shareData = {
      prompt: generation.prompt,
      itemType: generation.itemType,
      provider: generation.provider,
      imageUrl: generation.imageUrl,
      createdAt: generation.createdAt
    };
    
    const encodedData = btoa(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}/shared/${encodedData}`;
    
    copyToClipboard(shareUrl, 'Shareable link');
  };

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          Export & Share
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="share-title" className="text-xs font-medium">
              Title (optional)
            </Label>
            <Input
              id="share-title"
              value={shareTitle}
              onChange={(e) => setShareTitle(e.target.value)}
              placeholder="Add a title for sharing..."
              className="h-7 text-xs mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="share-description" className="text-xs font-medium">
              Description
            </Label>
            <Textarea
              id="share-description"
              value={shareDescription}
              onChange={(e) => setShareDescription(e.target.value)}
              placeholder="Add description..."
              className="text-xs mt-1 min-h-[60px]"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs font-medium">Export Options</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadImage('png')}
              disabled={isExporting}
              className="h-8 text-xs"
            >
              <ImageIcon className="h-3 w-3 mr-1" />
              PNG
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadImage('jpg')}
              disabled={isExporting}
              className="h-8 text-xs"
            >
              <ImageIcon className="h-3 w-3 mr-1" />
              JPG
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsPDF}
              disabled={isExporting}
              className="h-8 text-xs col-span-2"
            >
              <FileText className="h-3 w-3 mr-1" />
              {isExporting ? 'Generating...' : 'PDF Report'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs font-medium">Share Options</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generation.prompt, 'Prompt')}
              className="h-8 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Prompt
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generation.imageUrl, 'Image URL')}
              className="h-8 text-xs"
            >
              <Link className="h-3 w-3 mr-1" />
              Copy URL
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyImageAsDataUrl}
              className="h-8 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Image
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaEmail}
              className="h-8 text-xs"
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={generateShareableLink}
            className="w-full h-8 text-xs"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Generate Shareable Link
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <div className="font-medium mb-1">Generation Details:</div>
          <div className="space-y-0.5">
            <div>Provider: {generation.provider}</div>
            <div>Type: {generation.itemType}</div>
            <div>Created: {new Date(generation.createdAt).toLocaleString()}</div>
            {generation.rating && (
              <div>Rating: {'★'.repeat(generation.rating)}{'☆'.repeat(5 - generation.rating)}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};