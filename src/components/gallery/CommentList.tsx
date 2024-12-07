import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: number;
  text: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

interface CommentListProps {
  comments: Comment[];
}

export const CommentList = ({ comments }: CommentListProps) => {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{comment.user.name}</span>
              <span className="text-sm text-gray-400">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};