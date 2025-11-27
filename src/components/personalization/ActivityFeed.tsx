import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Heart, ShoppingBag, Star, TrendingUp, Award, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ActivityFeed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activity-feed", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const markAsRead = useMutation({
    mutationFn: async (activityId: string) => {
      const { error } = await supabase
        .from("activity_feed")
        .update({ is_read: true })
        .eq("id", activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-feed", user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from("activity_feed")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-feed", user?.id] });
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <Bell className="h-4 w-4" />;
      case "like":
        return <Heart className="h-4 w-4" />;
      case "purchase":
        return <ShoppingBag className="h-4 w-4" />;
      case "review":
        return <Star className="h-4 w-4" />;
      case "new_item":
        return <Package className="h-4 w-4" />;
      case "milestone":
        return <Award className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "follow":
        return "text-blue-400 bg-blue-400/10";
      case "like":
        return "text-pink-400 bg-pink-400/10";
      case "purchase":
        return "text-green-400 bg-green-400/10";
      case "review":
        return "text-yellow-400 bg-yellow-400/10";
      case "milestone":
        return "text-purple-400 bg-purple-400/10";
      default:
        return "text-acid-lime bg-acid-lime/10";
    }
  };

  const formatActivityMessage = (activity: any) => {
    const data = activity.activity_data || {};
    switch (activity.activity_type) {
      case "follow":
        return `${data.follower_name} started following you`;
      case "like":
        return `${data.liker_name} liked your ${data.item_type}`;
      case "purchase":
        return `Your ${data.item_type} was purchased by ${data.buyer_name}`;
      case "review":
        return `${data.reviewer_name} left a ${data.rating}-star review`;
      case "new_item":
        return `${data.creator_name} you follow posted a new ${data.item_type}`;
      case "milestone":
        return data.message || "You reached a milestone!";
      default:
        return "New activity";
    }
  };

  if (!user || isLoading) {
    return null;
  }

  const unreadCount = activities?.filter((a) => !a.is_read).length || 0;

  return (
    <section className="border border-ghost-white/10 rounded-none bg-void-black/50" aria-labelledby="activity-feed-heading">
      <div className="flex items-center justify-between p-4 border-b border-ghost-white/10">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-acid-lime" aria-hidden="true" />
          <h2 id="activity-feed-heading" className="font-mono uppercase tracking-widest text-ghost-white">
            ACTIVITY_FEED
          </h2>
          {unreadCount > 0 && (
            <span
              className="px-2 py-0.5 text-xs font-mono bg-acid-lime text-void-black rounded-full"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            className="text-slate-400 hover:text-acid-lime"
            aria-label="Mark all as read"
          >
            <Check className="h-4 w-4 mr-2" aria-hidden="true" />
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        {activities && activities.length > 0 ? (
          <ul className="divide-y divide-ghost-white/10" role="list" aria-label="Activity notifications">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className={`p-4 hover:bg-ghost-white/5 transition-colors ${
                  !activity.is_read ? "bg-acid-lime/5" : ""
                }`}
                role="listitem"
              >
                <button
                  onClick={() => !activity.is_read && markAsRead.mutate(activity.id)}
                  className="w-full text-left flex items-start gap-3"
                  aria-label={`${formatActivityMessage(activity)}. ${activity.is_read ? "Read" : "Unread"}`}
                >
                  <div
                    className={`p-2 rounded-none ${getActivityColor(activity.activity_type)}`}
                    aria-hidden="true"
                  >
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${activity.is_read ? "text-slate-400" : "text-ghost-white font-medium"}`}>
                      {formatActivityMessage(activity)}
                    </p>
                    <time className="text-xs text-slate-500 font-mono" dateTime={activity.created_at}>
                      {new Date(activity.created_at).toLocaleString()}
                    </time>
                  </div>
                  {!activity.is_read && (
                    <div className="w-2 h-2 rounded-full bg-acid-lime" aria-label="Unread indicator" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center" role="status">
            <Bell className="h-12 w-12 mx-auto text-slate-600 mb-3" aria-hidden="true" />
            <p className="text-slate-400">No activity yet</p>
          </div>
        )}
      </ScrollArea>
    </section>
  );
};
