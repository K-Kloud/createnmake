import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookmarkPlus, 
  Bookmark, 
  Search, 
  Copy, 
  Trash2,
  Star,
  Tag
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SavedPrompt {
  id: string;
  prompt: string;
  itemType: string;
  tags: string[];
  rating?: number;
  timesUsed: number;
  createdAt: number;
  lastUsed?: number;
}

interface SavedPromptsProps {
  onPromptSelect: (prompt: string) => void;
  className?: string;
}

export const SavedPrompts: React.FC<SavedPromptsProps> = ({
  onPromptSelect,
  className = ''
}) => {
  const { toast } = useToast();
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('saved-prompts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [newPrompt, setNewPrompt] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const saveToStorage = (prompts: SavedPrompt[]) => {
    localStorage.setItem('saved-prompts', JSON.stringify(prompts));
  };

  const savePrompt = () => {
    if (!newPrompt.trim()) return;
    
    const prompt: SavedPrompt = {
      id: crypto.randomUUID(),
      prompt: newPrompt.trim(),
      itemType: newItemType || 'General',
      tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean),
      timesUsed: 0,
      createdAt: Date.now()
    };
    
    const updatedPrompts = [prompt, ...savedPrompts];
    setSavedPrompts(updatedPrompts);
    saveToStorage(updatedPrompts);
    
    setNewPrompt('');
    setNewTags('');
    setNewItemType('');
    
    toast({
      title: "Saved",
      description: "Prompt saved to your collection"
    });
  };

  const usePrompt = (prompt: SavedPrompt) => {
    const updatedPrompts = savedPrompts.map(p => 
      p.id === prompt.id 
        ? { ...p, timesUsed: p.timesUsed + 1, lastUsed: Date.now() }
        : p
    );
    setSavedPrompts(updatedPrompts);
    saveToStorage(updatedPrompts);
    
    onPromptSelect(prompt.prompt);
    
    toast({
      title: "Applied",
      description: "Prompt applied to generator"
    });
  };

  const ratePrompt = (id: string, rating: number) => {
    const updatedPrompts = savedPrompts.map(p => 
      p.id === id ? { ...p, rating } : p
    );
    setSavedPrompts(updatedPrompts);
    saveToStorage(updatedPrompts);
  };

  const deletePrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updatedPrompts);
    saveToStorage(updatedPrompts);
    
    toast({
      title: "Deleted",
      description: "Prompt removed from collection"
    });
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard"
    });
  };

  const filteredPrompts = savedPrompts.filter(prompt => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      prompt.prompt.toLowerCase().includes(search) ||
      prompt.itemType.toLowerCase().includes(search) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(search))
    );
  });

  const popularPrompts = savedPrompts
    .filter(p => p.timesUsed > 0)
    .sort((a, b) => b.timesUsed - a.timesUsed)
    .slice(0, 3);

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Saved Prompts
            <Badge variant="secondary" className="text-xs">
              {savedPrompts.length} saved
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="new-prompt" className="text-xs font-medium">
                Save Current Prompt
              </Label>
              <div className="space-y-2 mt-1">
                <Input
                  id="new-prompt"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter prompt to save..."
                  className="h-7 text-xs"
                />
                
                <div className="flex gap-2">
                  <Input
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    placeholder="Item type"
                    className="h-6 text-xs"
                  />
                  <Input
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Tags (comma-separated)"
                    className="h-6 text-xs"
                  />
                </div>
                
                <Button
                  onClick={savePrompt}
                  size="sm"
                  className="h-6 text-xs"
                  disabled={!newPrompt.trim()}
                >
                  <BookmarkPlus className="h-3 w-3 mr-1" />
                  Save Prompt
                </Button>
              </div>
            </div>
            
            {popularPrompts.length > 0 && (
              <div>
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Most Used
                </Label>
                <div className="space-y-1 mt-1">
                  {popularPrompts.map((prompt) => (
                    <Button
                      key={prompt.id}
                      variant="outline"
                      size="sm"
                      onClick={() => usePrompt(prompt)}
                      className="h-8 text-xs w-full justify-start font-normal"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{prompt.prompt}</span>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {prompt.timesUsed}x
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-7 text-xs"
              />
            </div>
            
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {filteredPrompts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Bookmark className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">
                      {savedPrompts.length === 0 
                        ? 'No saved prompts yet' 
                        : 'No prompts match your search'
                      }
                    </p>
                  </div>
                ) : (
                  filteredPrompts.map((prompt) => (
                    <Card key={prompt.id} className="border-border/30 bg-card/20">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-medium line-clamp-2 flex-1">
                            {prompt.prompt}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {prompt.itemType}
                          </Badge>
                          {prompt.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-2 w-2 mr-0.5" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Button
                                key={star}
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => ratePrompt(prompt.id, star)}
                              >
                                <Star
                                  className={`h-2 w-2 ${
                                    (prompt.rating || 0) >= star 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </Button>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPrompt(prompt.prompt)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => usePrompt(prompt)}
                              className="h-6 px-2 text-xs"
                            >
                              Use
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePrompt(prompt.id)}
                              className="h-6 w-6 p-0 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          {filteredPrompts.length > 0 && (
            <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 p-2 rounded">
              💡 Tip: Rate your prompts to help identify the most effective ones.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};