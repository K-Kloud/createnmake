import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus } from 'lucide-react';
import { AddToCollectionDialog } from './AddToCollectionDialog';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface QuickAddToCollectionProps {
  imageId: number;
  imageUrl?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const QuickAddToCollection: React.FC<QuickAddToCollectionProps> = ({
  imageId,
  imageUrl,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to add images to collections');
      navigate('/auth');
      return;
    }

    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        title="Add to collection"
      >
        <FolderPlus className="h-4 w-4" />
        {showLabel && <span className="ml-2">Add to Collection</span>}
      </Button>

      <AddToCollectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        imageId={imageId}
        imageUrl={imageUrl}
      />
    </>
  );
};
