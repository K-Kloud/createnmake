
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
  room_id: string;
}

interface ChatRoom {
  id: string;
  users: Set<string>;
  sockets: Map<string, WebSocket>;
}

const chatRooms = new Map<string, ChatRoom>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers, url } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let currentRoom: string | null = null;
  let userId: string | null = null;
  let username: string | null = null;

  socket.onopen = () => {
    console.log("🔗 WebSocket connected");
    socket.send(JSON.stringify({
      type: "connected",
      message: "WebSocket connection established"
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📨 Received message:", data);

      switch (data.type) {
        case "join_room":
          await handleJoinRoom(data);
          break;
        case "leave_room":
          await handleLeaveRoom(data);
          break;
        case "send_message":
          await handleSendMessage(data);
          break;
        case "typing":
          await handleTyping(data);
          break;
        case "ping":
          socket.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({
        type: "error",
        message: "Failed to process message"
      }));
    }
  };

  socket.onerror = (error) => {
    console.error("🚨 WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("🔌 WebSocket disconnected");
    if (currentRoom && userId) {
      handleLeaveRoom({ room_id: currentRoom, user_id: userId });
    }
  };

  async function handleJoinRoom(data: any) {
    const { room_id, user_id, username: user_username } = data;
    
    if (!room_id || !user_id) {
      socket.send(JSON.stringify({
        type: "error",
        message: "Room ID and User ID are required"
      }));
      return;
    }

    // Leave current room if any
    if (currentRoom) {
      await handleLeaveRoom({ room_id: currentRoom, user_id: userId });
    }

    currentRoom = room_id;
    userId = user_id;
    username = user_username || "Anonymous";

    // Create or get room
    if (!chatRooms.has(room_id)) {
      chatRooms.set(room_id, {
        id: room_id,
        users: new Set(),
        sockets: new Map(),
      });
    }

    const room = chatRooms.get(room_id)!;
    room.users.add(user_id);
    room.sockets.set(user_id, socket);

    // Notify room about new user
    broadcastToRoom(room_id, {
      type: "user_joined",
      user_id,
      username,
      users_count: room.users.size,
      timestamp: new Date().toISOString()
    }, user_id);

    // Send room info to user
    socket.send(JSON.stringify({
      type: "room_joined",
      room_id,
      users_count: room.users.size,
      users: Array.from(room.users)
    }));

    // Load recent messages from database
    try {
      const { data: messages } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .eq('room_id', room_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messages) {
        socket.send(JSON.stringify({
          type: "message_history",
          messages: messages.reverse()
        }));
      }
    } catch (error) {
      console.error("Error loading message history:", error);
    }

    console.log(`👤 User ${username} joined room ${room_id}`);
  }

  async function handleLeaveRoom(data: any) {
    const { room_id, user_id } = data;
    
    if (!room_id || !user_id) return;

    const room = chatRooms.get(room_id);
    if (!room) return;

    room.users.delete(user_id);
    room.sockets.delete(user_id);

    // Clean up empty rooms
    if (room.users.size === 0) {
      chatRooms.delete(room_id);
    } else {
      // Notify room about user leaving
      broadcastToRoom(room_id, {
        type: "user_left",
        user_id,
        username,
        users_count: room.users.size,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`👋 User ${username} left room ${room_id}`);
  }

  async function handleSendMessage(data: any) {
    const { message, room_id } = data;
    
    if (!message || !room_id || !userId || !username) {
      socket.send(JSON.stringify({
        type: "error",
        message: "Invalid message data"
      }));
      return;
    }

    const messageId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const chatMessage: ChatMessage = {
      id: messageId,
      user_id: userId,
      username,
      message,
      timestamp,
      room_id
    };

    // Store message in database
    try {
      await supabaseClient
        .from('chat_messages')
        .insert({
          id: messageId,
          user_id: userId,
          room_id,
          message,
          username,
          created_at: timestamp
        });
    } catch (error) {
      console.error("Error storing message:", error);
    }

    // Broadcast to room
    broadcastToRoom(room_id, {
      type: "new_message",
      ...chatMessage
    });

    console.log(`💬 Message from ${username} in room ${room_id}: ${message}`);
  }

  async function handleTyping(data: any) {
    const { room_id, is_typing } = data;
    
    if (!room_id || !userId || !username) return;

    broadcastToRoom(room_id, {
      type: "user_typing",
      user_id: userId,
      username,
      is_typing,
      timestamp: new Date().toISOString()
    }, userId);
  }

  function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const room = chatRooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    
    room.sockets.forEach((socket, userId) => {
      if (excludeUserId && userId === excludeUserId) return;
      
      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(messageStr);
        }
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
        // Remove broken socket
        room.sockets.delete(userId);
        room.users.delete(userId);
      }
    });
  }

  return response;
});
