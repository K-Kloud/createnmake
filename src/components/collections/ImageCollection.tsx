import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  Share2,
  Download,
  Trash2,
  Eye,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Collection {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  image_count: number;
  cover_image?: string;
}

interface CollectionImage {
  id: number;
  image_url: string;
  prompt: string;
  item_type: string;
  created_at: string;
  likes: number;
  views: number;
}

export const ImageCollection = () => {
  const { session } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [images, setImages] = useState<CollectionImage[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  useEffect(() => {
    fetchCollections();
  }, [session]);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionImages(selectedCollection.id);
    }
  }, [selectedCollection]);

  const fetchCollections = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('image_collections')
        .select(`
          *,
          collection_images(count)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCollections = data?.map(collection => ({
        ...collection,
        image_count: collection.collection_images?.[0]?.count || 0
      })) || [];

      setCollections(formattedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollectionImages = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('collection_images')
        .select(`
          *,
          generated_images(
            id,
            image_url,
            prompt,
            item_type,
            created_at,
            likes,
            views
          )
        `)
        .eq('collection_id', collectionId);

      if (error) throw error;

      const formattedImages = data?.map(item => item.generated_images).filter(Boolean) || [];
      setImages(formattedImages);
    } catch (error) {
      console.error('Error fetching collection images:', error);
      toast.error('Failed to load images');
    }
  };

  const createCollection = async () => {
    if (!session?.user || !newCollectionName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('image_collections')
        .insert({
          name: newCollectionName,
          description: newCollectionDescription,
          user_id: session.user.id,
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      setCollections(prev => [{ ...data, image_count: 0 }, ...prev]);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateForm(false);
      toast.success('Collection created successfully');
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    try {
      const { error } = await supabase
        .from('image_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(prev => prev.filter(c => c.id !== collectionId));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
      toast.success('Collection deleted');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.item_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || image.item_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const uniqueTypes = [...new Set(images.map(img => img.item_type))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-pulse text-muted-foreground">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">My Collections</h2>
          <p className="text-muted-foreground">Organize and manage your generated images</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={createCollection} disabled={!newCollectionName.trim()}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          {collections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">No collections yet</h3>
                  <p className="text-muted-foreground">Create your first collection to organize your images</p>
                  <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                    Create Collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <Card 
                  key={collection.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCollection(collection)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold truncate">{collection.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCollection(collection.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{collection.image_count} images</span>
                      <Badge variant="outline">
                        {collection.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Your Favorites</h3>
                <p className="text-muted-foreground">Images you've liked will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedCollection && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedCollection.name}
                  <Badge variant="outline">{images.length} images</Badge>
                </CardTitle>
                {selectedCollection.description && (
                  <p className="text-muted-foreground mt-1">{selectedCollection.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCollection(null)}
                >
                  Back
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'No images match your search criteria'
                  : 'No images in this collection yet'
                }
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm truncate">{image.prompt}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {image.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {image.views}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredImages.map((image) => (
                  <div key={image.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{image.prompt}</h4>
                      <p className="text-sm text-muted-foreground">Type: {image.item_type}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {image.likes} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {image.views} views
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};