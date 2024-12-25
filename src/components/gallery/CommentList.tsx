import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Reply {
  id: number;
  text: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

interface Comment {
  id: number;
  text: string;
  user: {
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

  const handleReply = (commentId: number) => {
    if (replyText[commentId]?.trim()) {
      onAddReply(commentId, replyText[commentId]);
      setReplyText(prev => ({ ...prev, [commentId]: "" }));
      setShowReplyInput(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(date instanceof Date ? date : new Date(date), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
              <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.user.name}</span>
                <span className="text-sm text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
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
                      <AvatarFallback>{reply.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{reply.user.name}</span>
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