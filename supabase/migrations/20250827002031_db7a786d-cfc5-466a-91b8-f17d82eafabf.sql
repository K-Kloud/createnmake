-- Create conversations table for managing chat threads
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  conversation_type TEXT NOT NULL DEFAULT 'direct', -- 'direct', 'order', 'quote'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_archived BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  -- Context references
  order_id BIGINT REFERENCES artisan_quotes(id),
  quote_request_id BIGINT,
  -- Participants (stored as array for flexibility)
  participants JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id)
);

-- Create messages table for individual messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'file', 'system', 'quote_update'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  -- For system messages and structured content
  system_data JSONB,
  -- Reply functionality
  reply_to_id UUID REFERENCES messages(id)
);

-- Create message attachments table
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation participants table for better querying
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT DEFAULT 'participant', -- 'participant', 'admin', 'observer'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_muted BOOLEAN DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM conversation_participants 
    WHERE conversation_id = conversations.id
  )
);

CREATE POLICY "Authenticated users can create conversations" ON conversations
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Participants can update conversations" ON conversations
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM conversation_participants 
    WHERE conversation_id = conversations.id
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id
  )
);

CREATE POLICY "Authenticated users can send messages" ON messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  auth.uid() IN (
    SELECT user_id FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id
  )
);

CREATE POLICY "Users can update their own messages" ON messages
FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments in their conversations" ON message_attachments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_attachments.message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload attachments to their messages" ON message_attachments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_attachments.message_id AND m.sender_id = auth.uid()
  )
);

-- RLS Policies for conversation participants
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
FOR SELECT USING (
  user_id = auth.uid() OR
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join conversations" ON conversation_participants
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON conversation_participants
FOR UPDATE USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();