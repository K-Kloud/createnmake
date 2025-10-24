import React from 'react';
import { CheckSquare, Square, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRemove: () => void;
}

export const BulkActionsToolbar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onRemove,
}: BulkActionsToolbarProps) => {
  const allSelected = selectedCount === totalCount;

  return (
    <Card className="p-4 mb-6 sticky top-20 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="gap-2"
          >
            {allSelected ? (
              <>
                <CheckSquare className="h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                Select All
              </>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {totalCount} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
};
