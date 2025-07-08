import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEnhancedRealtimeFeatures } from '@/hooks/useEnhancedRealtimeFeatures';
import { 
  Circle, 
  Clock, 
  Smartphone, 
  Monitor, 
  Tablet,
  User
} from 'lucide-react';

interface EnhancedPresenceIndicatorProps {
  channelName: string;
  maxVisible?: number;
  showDeviceInfo?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-green-500';
    case 'idle':
      return 'text-yellow-500';
    case 'offline':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
};

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case 'mobile':
      return <Smartphone className="h-3 w-3" />;
    case 'tablet':
      return <Tablet className="h-3 w-3" />;
    case 'desktop':
    default:
      return <Monitor className="h-3 w-3" />;
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const EnhancedPresenceIndicator: React.FC<EnhancedPresenceIndicatorProps> = ({
  channelName,
  maxVisible = 5,
  showDeviceInfo = true
}) => {
  const { useChannelSessions } = useEnhancedRealtimeFeatures();
  const { data: sessions, isLoading } = useChannelSessions(channelName);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading presence...</span>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="text-sm">No active users</span>
      </div>
    );
  }

  const visibleSessions = sessions.slice(0, maxVisible);
  const remainingCount = Math.max(0, sessions.length - maxVisible);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {visibleSessions.map((session) => {
            const presenceData = session.presence_data as any;
            const deviceInfo = session.device_info as any;
            const userName = presenceData?.name || presenceData?.username || 'Unknown User';
            
            return (
              <Tooltip key={session.id}>
                <TooltipTrigger>
                  <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-background">
                      <AvatarImage src={presenceData?.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(session.status)}`}>
                      <Circle className="w-full h-full fill-current" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{userName}</span>
                      <Badge variant="outline" className="capitalize">
                        {session.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last seen: {new Date(session.last_seen).toLocaleTimeString()}
                    </div>
                    
                    {showDeviceInfo && deviceInfo?.type && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getDeviceIcon(deviceInfo.type)}
                        <span className="capitalize">{deviceInfo.type}</span>
                        {deviceInfo.browser && (
                          <span>• {deviceInfo.browser}</span>
                        )}
                      </div>
                    )}
                    
                    {presenceData?.cursor && (
                      <div className="text-xs text-muted-foreground">
                        Cursor: ({presenceData.cursor.x}, {presenceData.cursor.y})
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {remainingCount > 0 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium">+{remainingCount}</span>
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {sessions.length} {sessions.length === 1 ? 'user' : 'users'} online
        </div>
      </div>
    </TooltipProvider>
  );
};