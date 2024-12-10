import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { AspectRatioSelect } from "./generator/AspectRatioSelect";
import { ItemSelect } from "./generator/ItemSelect";
import { ReferenceImageUpload } from "./generator/ReferenceImageUpload";
import { PreviewDialog } from "./generator/PreviewDialog";
import { useToast } from "@/components/ui/use-toast";
import { generateImage } from "@/services/imageGeneration";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("square");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleGenerate = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate images",
        variant: "destructive",
      });
      return;
    }

    if (!selectedItem || !prompt) {
      toast({
        title: !selectedItem ? "Item Required" : "Prompt Required",
        description: !selectedItem 
          ? "Please select an item to generate"
          : "Please enter a description of what you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setPreviewOpen(true);

    try {
      // Create a record in the database
      const { data: dbRecord, error: dbError } = await supabase
        .from('generated_images')
        .insert({
          user_id: session.user.id,
          prompt: `${selectedItem}: ${prompt}`,
          item_type: selectedItem,
          aspect_ratio: selectedRatio,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Generate the image
      const result = await generateImage({
        prompt: `${selectedItem}: ${prompt}`,
        width: 1024,
        height: 1024
      });
      
      // Update the record with the generated image URL
      const { error: updateError } = await supabase
        .from('generated_images')
        .update({ 
          image_url: result.url,
          status: 'completed'
        })
        .eq('id', dbRecord.id);

      if (updateError) throw updateError;
      
      toast({
        title: "Image Generated",
        description: "Your image has been generated successfully",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });

      // Update status to failed if we have a database record
      if (error.id) {
        await supabase
          .from('generated_images')
          .update({ status: 'failed' })
          .eq('id', error.id);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-float">
      <div className="glass-card p-6 rounded-xl space-y-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(110,89,165,0.5)] hover:border-primary/50">
        <ItemSelect 
          value={selectedItem} 
          onChange={setSelectedItem} 
        />

        <ReferenceImageUpload
          referenceImage={referenceImage}
          onUpload={setReferenceImage}
        />

        <AspectRatioSelect
          value={selectedRatio}
          onChange={setSelectedRatio}
        />

        <Textarea
          placeholder="Describe what you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />

        <PreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          isGenerating={isGenerating}
          selectedRatio={selectedRatio}
        />

        <Button 
          onClick={handleGenerate} 
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          disabled={!prompt || !selectedItem || isGenerating}
        >
          Generate
        </Button>
      </div>
    </div>
  );
};