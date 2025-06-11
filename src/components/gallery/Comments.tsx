
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { CommentList } from "./CommentList";
import { useTranslation } from "react-i18next";

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

interface CommentsProps {
  imageId: number;
  comments: Comment[];
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
}

export const Comments = ({ imageId, comments, onAddComment, onAddReply }: CommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const { t } = useTranslation('common');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(imageId, newComment);
      setNewComment("");
    }
  };

  const handleAddReply = (commentId: number, replyText: string) => {
    onAddReply(imageId, commentId, replyText);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-4 w-4" />
        <span>{comments.length} {t('imageCard.comments')}</span>
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('imageCard.addComment')}
          className="flex-1"
        />
        <Button type="submit" size="sm">
          {t('buttons.post')}
        </Button>
      </form>

      <CommentList comments={comments} onAddReply={handleAddReply} />
    </div>
  );
};
