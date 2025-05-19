
import { format, isValid, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getInitials } from "@/lib/utils";

interface Reply {
  id: number;
  text: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

interface Comment {
  id: number;
  text: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  replies?: Reply[];
}

interface CommentListProps {
  comments: Comment[];
  onAddReply: (commentId: number, replyText: string) => void;
}

export const CommentList = ({ comments, onAddReply }: CommentListProps) => {
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<{ [key: number]: boolean }>({});
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleReply = (commentId: number) => {
    if (replyText[commentId]?.trim()) {
      onAddReply(commentId, replyText[commentId]);
      setReplyText(prev => ({ ...prev, [commentId]: "" }));
      setShowReplyInput(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDeleteComment = async (commentId: number, userId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Recently';
    
    let dateObj: Date;
    
    if (typeof date === 'string') {
      try {
        dateObj = parseISO(date);
      } catch (error) {
        console.error('Error parsing date string:', error, date);
        return 'Invalid date';
      }
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      console.warn('Invalid date object:', dateObj);
      return 'Recently';
    }
    
    try {
      return format(dateObj, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      console.error('Error formatting date:', error, dateObj);
      return 'Recently';
    }
  };

  const getUserInitials = (name: string) => {
    if (!name || name === 'Anonymous User') return '?';
    return getInitials(name);
  };

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
              <AvatarFallback>{getUserInitials(comment.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                {session?.user && session.user.id === comment.user.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => handleDeleteComment(comment.id, comment.user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs mt-1"
                onClick={() => setShowReplyInput(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
              >
                Reply
              </Button>
            </div>
          </div>

          {showReplyInput[comment.id] && (
            <div className="ml-11 mt-2 flex space-x-2">
              <Input
                value={replyText[comment.id] || ""}
                onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                placeholder="Write a reply..."
                className="flex-1"
              />
              <Button size="sm" onClick={() => handleReply(comment.id)}>
                Post
              </Button>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <Collapsible className="ml-11">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex space-x-3 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                      <AvatarFallback>{getUserInitials(reply.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {reply.user.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      ))}
    </div>
  );
};
