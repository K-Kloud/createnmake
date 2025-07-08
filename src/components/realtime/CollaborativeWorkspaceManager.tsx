import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedRealtimeFeatures } from '@/hooks/useEnhancedRealtimeFeatures';
import { EnhancedPresenceIndicator } from './EnhancedPresenceIndicator';
import { LoadingState } from '@/components/ui/loading-state';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  FileText, 
  Code, 
  Palette, 
  Users, 
  Lock,
  Unlock,
  Clock,
  Edit,
  Share,
  Copy
} from 'lucide-react';

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'design':
      return <Palette className="h-4 w-4" />;
    case 'code':
      return <Code className="h-4 w-4" />;
    case 'text':
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const CollaborativeWorkspaceManager: React.FC = () => {
  const {
    useCollaborativeDocuments,
    createCollaborativeDocument,
    updateDocumentContent,
    startRealtimeSession
  } = useEnhancedRealtimeFeatures();
  
  const { data: documents, isLoading, error } = useCollaborativeDocuments();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'text' as 'design' | 'text' | 'code',
    collaborators: ''
  });

  const handleCreateDocument = async () => {
    if (!newDocument.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Document name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const collaboratorsList = newDocument.collaborators
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      await createCollaborativeDocument.mutateAsync({
        documentName: newDocument.name,
        documentType: newDocument.type,
        content: { blocks: [], version: 1 },
        collaborators: collaboratorsList
      });

      setIsCreateDialogOpen(false);
      setNewDocument({ name: '', type: 'text', collaborators: '' });
      
      toast({
        title: "Document Created",
        description: `"${newDocument.name}" has been created successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create document",
        variant: "destructive"
      });
    }
  };

  const joinDocumentSession = async (documentId: string, documentName: string) => {
    try {
      await startRealtimeSession.mutateAsync({
        channelName: `document:${documentId}`,
        presenceData: {
          documentId,
          documentName,
          role: 'collaborator'
        },
        deviceInfo: {
          type: 'desktop',
          browser: navigator.userAgent
        }
      });

      toast({
        title: "Joined Session",
        description: `You've joined the collaborative session for "${documentName}"`,
      });
    } catch (error: any) {
      toast({
        title: "Join Failed",
        description: error.message || "Failed to join session",
        variant: "destructive"
      });
    }
  };

  const copyDocumentLink = (documentId: string) => {
    const link = `${window.location.origin}/collaborate/${documentId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Collaboration link has been copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Collaborative Workspace</h2>
          <p className="text-muted-foreground">Real-time document collaboration</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collaborative Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Document Name</label>
                <Input
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter document name..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Document Type</label>
                <Select
                  value={newDocument.type}
                  onValueChange={(value: 'design' | 'text' | 'code') =>
                    setNewDocument(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Document</SelectItem>
                    <SelectItem value="design">Design Board</SelectItem>
                    <SelectItem value="code">Code Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Collaborators (optional)</label>
                <Input
                  value={newDocument.collaborators}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, collaborators: e.target.value }))}
                  placeholder="Enter email addresses separated by commas..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Users will be invited to collaborate on this document
                </p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleCreateDocument}
                  disabled={createCollaborativeDocument.isPending}
                  className="flex-1"
                >
                  {createCollaborativeDocument.isPending ? 'Creating...' : 'Create Document'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <LoadingState
        isLoading={isLoading}
        error={error}
        loadingMessage="Loading collaborative documents..."
        errorMessage="Failed to load documents"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents?.map((doc) => (
            <Card key={doc.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getDocumentIcon(doc.document_type)}
                  <span className="truncate">{doc.document_name}</span>
                  {doc.lock_info && (
                    <Lock className="h-4 w-4 text-yellow-500" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {doc.document_type}
                  </Badge>
                  <Badge variant="secondary">
                    v{doc.version}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Updated {new Date(doc.updated_at).toLocaleDateString()}
                </div>
                
                <EnhancedPresenceIndicator 
                  channelName={`document:${doc.id}`}
                  maxVisible={3}
                />
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {doc.collaborators.length} collaborator(s)
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => joinDocumentSession(doc.id, doc.document_name)}
                    disabled={startRealtimeSession.isPending}
                    className="flex items-center gap-1 flex-1"
                  >
                    <Edit className="h-3 w-3" />
                    {startRealtimeSession.isPending ? 'Joining...' : 'Join Session'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyDocumentLink(doc.id)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Share className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) || []}
        </div>

        {(!documents || documents.length === 0) && (
          <Card className="glass-card">
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first collaborative document to start working with your team.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </CardContent>
          </Card>
        )}
      </LoadingState>
    </div>
  );
};