
import { memo } from 'react';

export const EmptyPreview = memo(() => {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[300px]">
      <p className="text-muted-foreground">Preview will appear here</p>
    </div>
  );
});
