import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  Star, 
  Heart, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { useGenerationHistory, GenerationRecord } from '@/hooks/useGenerationHistory';
import { formatDistanceToNow } from 'date-fns';

interface GenerationHistoryProps {
  className?: string;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  className = ''
}) => {
  const {
    history,
    favorites,
    toggleFavorite,
    rateGeneration,
    deleteGeneration,
    clearHistory,
    exportHistory,
    getFilteredHistory
  } = useGenerationHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredHistory = getFilteredHistory({
    search: searchTerm,
    provider: filterProvider || undefined,
    itemType: filterType || undefined
  }).filter(record => !showFavoritesOnly || record.isFavorite);

  const providers = [...new Set(history.map(h => h.provider))];
  const itemTypes = [...new Set(history.map(h => h.itemType))];

  const GenerationCard: React.FC<{ record: GenerationRecord }> = ({ record }) => (
    <Card className="border-border/50 bg-card/30">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {record.imageUrl ? (
              <img 
                src={record.imageUrl} 
                alt="Generated" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium line-clamp-2 mb-1">
              {record.prompt}
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {record.itemType}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {record.provider}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
              </span>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleFavorite(record.id)}
                >
                  <Heart 
                    className={`h-3 w-3 ${record.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                  />
                </Button>
                
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => rateGeneration(record.id, star)}
                    >
                      <Star
                        className={`h-2 w-2 ${
                          (record.rating || 0) >= star 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => deleteGeneration(record.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Generation History
            <Badge variant="secondary" className="text-xs">
              {history.length} generations
            </Badge>
            {favorites.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {favorites.length} favorites
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                exportHistory();
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search generations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-7 text-xs"
                />
              </div>
              
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="h-7 px-2"
              >
                <Heart className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={filterProvider} onValueChange={setFilterProvider}>
                <SelectTrigger className="h-7 text-xs flex-1">
                  <SelectValue placeholder="All providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">All providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider} className="text-xs">
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-7 text-xs flex-1">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">All types</SelectItem>
                  {itemTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {history.length === 0 
                      ? 'No generations yet' 
                      : 'No generations match your filters'
                    }
                  </p>
                </div>
              ) : (
                filteredHistory.map((record) => (
                  <GenerationCard key={record.id} record={record} />
                ))
              )}
            </div>
          </ScrollArea>
          
          {history.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {filteredHistory.length} of {history.length} generations
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-6 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};