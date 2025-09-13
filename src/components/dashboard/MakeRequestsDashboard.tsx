import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Eye, 
  Heart, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  User,
  Calendar,
  Package
} from "lucide-react";

interface MakeRequest {
  id: string;
  user_id: string;
  creator_id: string;
  product_image_url: string;
  product_prompt: string;
  product_price: string;
  creator_name: string;
  product_details: any;
  status: string;
  created_at: string;
  updated_at: string;
  admin_notes: string;
  assigned_artisan_id: string;
  assigned_manufacturer_id: string;
  // Profile data will be joined
  user_profile?: {
    display_name: string;
    avatar_url: string;
  };
}

export const MakeRequestsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MakeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMakeRequests();
    }
  }, [user]);

  const fetchMakeRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('make_requests')
        .select(`
          *,
          user_profile:profiles!make_requests_user_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        user_profile: Array.isArray(item.user_profile) ? item.user_profile[0] : item.user_profile
      }));
      
      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching make requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch make requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('make_requests')
        .update({
          status,
          admin_notes: notes || adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Updated",
        description: `Request status changed to ${status}`
      });

      fetchMakeRequests();
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const assignToArtisan = async (requestId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('make_requests')
        .update({
          assigned_artisan_id: user?.id,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Assigned",
        description: "Request has been assigned to you"
      });

      fetchMakeRequests();
    } catch (error) {
      console.error('Error assigning request:', error);
      toast({
        title: "Error",
        description: "Failed to assign request",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", icon: Clock },
      assigned: { color: "bg-blue-500", icon: User },
      in_progress: { color: "bg-orange-500", icon: Package },
      completed: { color: "bg-green-500", icon: CheckCircle },
      cancelled: { color: "bg-red-500", icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading make requests...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const assignedRequests = requests.filter(r => r.assigned_artisan_id === user?.id || r.assigned_manufacturer_id === user?.id);
  const allRequests = requests;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Make Requests Dashboard</h1>
        <p className="text-muted-foreground">Manage manufacturing requests from customers</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="assigned">My Assignments ({assignedRequests.length})</TabsTrigger>
          <TabsTrigger value="all">All Requests ({allRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onSelect={setSelectedRequest}
                onAssign={assignToArtisan}
                showAssignButton={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedRequests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onSelect={setSelectedRequest}
                showAssignButton={false}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allRequests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onSelect={setSelectedRequest}
                showAssignButton={request.status === 'pending'}
                onAssign={assignToArtisan}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Request Details
                    {getStatusBadge(selectedRequest.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(selectedRequest.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedRequest(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedRequest.product_image_url}
                  alt={selectedRequest.product_prompt}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-2">
                <h3 className="font-semibold">Product Description</h3>
                <p className="text-sm">{selectedRequest.product_prompt}</p>
                <p className="text-sm text-muted-foreground">
                  Original Price: {selectedRequest.product_price}
                </p>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedRequest.user_profile?.avatar_url} />
                    <AvatarFallback>
                      {selectedRequest.user_profile?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {selectedRequest.user_profile?.display_name || 'Unknown User'}
                  </span>
                </div>
              </div>

              {/* Creator Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">Original Creator</h3>
                <p className="text-sm">{selectedRequest.creator_name}</p>
              </div>

              {/* Product Stats */}
              {selectedRequest.product_details && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Design Stats</h3>
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{selectedRequest.product_details.likes || 0} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{selectedRequest.product_details.views || 0} views</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes || selectedRequest.admin_notes || ""}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => updateRequestStatus(selectedRequest.id, 'in_progress')}
                  disabled={updating}
                  className="flex-1"
                >
                  Mark In Progress
                </Button>
                <Button
                  onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                  disabled={updating}
                  variant="outline"
                  className="flex-1"
                >
                  Mark Completed
                </Button>
                <Button
                  onClick={() => updateRequestStatus(selectedRequest.id, 'cancelled')}
                  disabled={updating}
                  variant="destructive"
                  className="flex-1"
                >
                  Cancel Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

interface RequestCardProps {
  request: MakeRequest;
  onSelect: (request: MakeRequest) => void;
  onAssign?: (requestId: string) => void;
  showAssignButton: boolean;
}

const RequestCard = ({ request, onSelect, onAssign, showAssignButton }: RequestCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Image */}
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={request.product_image_url}
              alt={request.product_prompt}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-1">
            <h3 className="font-medium line-clamp-2 text-sm">
              {request.product_prompt}
            </h3>
            <p className="text-xs text-muted-foreground">
              by {request.creator_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Price: {request.product_price}
            </p>
          </div>

          {/* Status and Date */}
          <div className="flex items-center justify-between">
            {getStatusBadge(request.status)}
            <span className="text-xs text-muted-foreground">
              {new Date(request.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Customer */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.user_profile?.avatar_url} />
              <AvatarFallback className="text-xs">
                {request.user_profile?.display_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">
              {request.user_profile?.display_name || 'Customer'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelect(request)}
              className="flex-1"
            >
              View Details
            </Button>
            {showAssignButton && onAssign && (
              <Button
                size="sm"
                onClick={() => onAssign(request.id)}
                className="flex-1"
              >
                Assign to Me
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { color: "bg-yellow-500", icon: Clock },
    assigned: { color: "bg-blue-500", icon: User },
    in_progress: { color: "bg-orange-500", icon: Package },
    completed: { color: "bg-green-500", icon: CheckCircle },
    cancelled: { color: "bg-red-500", icon: XCircle }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} text-white`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};