import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';

interface MessageComposerProps {
  conversationId: string;
  replyToId?: string;
  onReplyCancel?: () => void;
}

export const MessageComposer = ({ 
  conversationId, 
  replyToId, 
  onReplyCancel 
}: MessageComposerProps) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const { sendMessage } = useMessages(conversationId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return;

    try {
      await sendMessage.mutateAsync({
        content: content.trim(),
        replyToId,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      setContent('');
      setAttachments([]);
      onReplyCancel?.();
      
      // Focus back to textarea
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Reply indicator */}
      {replyToId && (
        <div className="flex items-center justify-between p-2 bg-muted rounded">
          <span className="text-sm text-muted-foreground">Replying to message</span>
          <Button variant="ghost" size="sm" onClick={onReplyCancel}>
            Cancel
          </Button>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
              <span className="text-sm truncate flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
        </div>

        <div className="flex gap-1">
          {/* File attachment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Emoji picker */}
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!content.trim() && attachments.length === 0}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />
    </div>
  );
};