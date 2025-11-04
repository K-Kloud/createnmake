import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MakerRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  makerId: string;
  makerName: string;
  makerType: 'artisan' | 'manufacturer';
  orderId: string;
}

interface RatingCategory {
  name: string;
  label: string;
  description: string;
}

const artisanCategories: RatingCategory[] = [
  { name: 'craftsmanship', label: 'Craftsmanship', description: 'Quality of work and attention to detail' },
  { name: 'communication', label: 'Communication', description: 'Responsiveness and clarity' },
  { name: 'delivery', label: 'Delivery', description: 'Timeliness and packaging' },
];

export const MakerRatingDialog = ({
  open,
  onOpenChange,
  makerId,
  makerName,
  makerType,
  orderId,
}: MakerRatingDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [overallRating, setOverallRating] = useState(0);
  const [craftsmanshipRating, setCraftsmanshipRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState<{ category: string; value: number } | null>(null);

  const submitReview = useMutation({
    mutationFn: async () => {
      const table = makerType === 'artisan' ? 'artisan_reviews' : 'manufacturer_reviews';
      const reviewData = {
        [makerType === 'artisan' ? 'artisan_id' : 'manufacturer_id']: makerId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        order_id: parseInt(orderId),
        rating: overallRating,
        comment: comment.trim() || null,
        ...(makerType === 'artisan' && {
          craftsmanship_rating: craftsmanshipRating,
          communication_rating: communicationRating,
          delivery_rating: deliveryRating,
        }),
      };

      const { error } = await supabase
        .from(table)
        .insert(reviewData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit review',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setOverallRating(0);
    setCraftsmanshipRating(0);
    setCommunicationRating(0);
    setDeliveryRating(0);
    setComment('');
  };

  const renderStars = (
    rating: number,
    setRating: (value: number) => void,
    category: string
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isHovered = hoveredRating?.category === category && hoveredRating.value >= star;
          const isFilled = rating >= star;
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating({ category, value: star })}
              onMouseLeave={() => setHoveredRating(null)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled || isHovered
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  const canSubmit = overallRating > 0 && (
    makerType === 'manufacturer' || 
    (craftsmanshipRating > 0 && communicationRating > 0 && deliveryRating > 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {makerName}</DialogTitle>
          <DialogDescription>
            Share your experience with this {makerType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            {renderStars(overallRating, setOverallRating, 'overall')}
          </div>

          {/* Detailed Ratings for Artisans */}
          {makerType === 'artisan' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Craftsmanship</Label>
                <p className="text-xs text-muted-foreground">Quality of work and attention to detail</p>
                {renderStars(craftsmanshipRating, setCraftsmanshipRating, 'craftsmanship')}
              </div>

              <div className="space-y-2">
                <Label>Communication</Label>
                <p className="text-xs text-muted-foreground">Responsiveness and clarity</p>
                {renderStars(communicationRating, setCommunicationRating, 'communication')}
              </div>

              <div className="space-y-2">
                <Label>Delivery</Label>
                <p className="text-xs text-muted-foreground">Timeliness and packaging</p>
                {renderStars(deliveryRating, setDeliveryRating, 'delivery')}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => submitReview.mutate()}
            disabled={!canSubmit || submitReview.isPending}
          >
            {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
