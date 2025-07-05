import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useContentTemplates, useCreateContentBlock, useUpdateContentBlock } from '@/hooks/useContentManagement';

interface ContentBlock {
  id?: string;
  block_key: string;
  block_type: string;
  title: string;
  content: any;
  metadata: any;
  locale: string;
  is_active: boolean;
}

interface ContentBlockEditorProps {
  contentBlock?: ContentBlock;
  onSave?: () => void;
  onCancel?: () => void;
}

export const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  contentBlock,
  onSave,
  onCancel,
}) => {
  const { data: templates } = useContentTemplates();
  const createMutation = useCreateContentBlock();
  const updateMutation = useUpdateContentBlock();

  const [formData, setFormData] = useState<ContentBlock>({
    block_key: contentBlock?.block_key || '',
    block_type: contentBlock?.block_type || 'text',
    title: contentBlock?.title || '',
    content: contentBlock?.content || {},
    metadata: contentBlock?.metadata || {},
    locale: contentBlock?.locale || 'en',
    is_active: contentBlock?.is_active ?? true,
    ...contentBlock,
  });

  const [contentJson, setContentJson] = useState(
    JSON.stringify(formData.content, null, 2)
  );

  const [metadataJson, setMetadataJson] = useState(
    JSON.stringify(formData.metadata, null, 2)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const parsedContent = JSON.parse(contentJson);
      const parsedMetadata = JSON.parse(metadataJson);
      
      const dataToSave = {
        ...formData,
        content: parsedContent,
        metadata: parsedMetadata,
      };

      if (contentBlock?.id) {
        await updateMutation.mutateAsync({ ...dataToSave, id: contentBlock.id });
      } else {
        await createMutation.mutateAsync(dataToSave);
      }
      
      onSave?.();
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {contentBlock ? 'Edit Content Block' : 'Create Content Block'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="block_key">Block Key</Label>
              <Input
                id="block_key"
                value={formData.block_key}
                onChange={(e) => setFormData({ ...formData, block_key: e.target.value })}
                placeholder="unique-block-key"
                required
              />
            </div>
            <div>
              <Label htmlFor="block_type">Block Type</Label>
              <Select
                value={formData.block_type}
                onValueChange={(value) => setFormData({ ...formData, block_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locale">Locale</Label>
              <Select
                value={formData.locale}
                onValueChange={(value) => setFormData({ ...formData, locale: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content (JSON)</Label>
            <Textarea
              id="content"
              value={contentJson}
              onChange={(e) => setContentJson(e.target.value)}
              rows={8}
              className="font-mono text-sm"
              placeholder='{"text": "Your content here"}'
            />
          </div>

          <div>
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              value={metadataJson}
              onChange={(e) => setMetadataJson(e.target.value)}
              rows={4}
              className="font-mono text-sm"
              placeholder='{"tags": ["example"]}'
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};