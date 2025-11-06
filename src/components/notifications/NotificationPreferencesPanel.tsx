import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Trophy, Shield, ShoppingCart, CreditCard, UserPlus, Heart, TrendingUp, Gift, Clock, Users } from 'lucide-react';
import { EmailTemplatePreview } from './EmailTemplatePreview';

interface NotificationChannel {
  email: boolean;
  toast: boolean;
  in_app: boolean;
}

export interface NotificationPreferences {
  milestone: NotificationChannel;
  badge: NotificationChannel;
  leaderboard: NotificationChannel;
  engagement: NotificationChannel;
  subscription: NotificationChannel;
  welcome: NotificationChannel;
  security: NotificationChannel;
  verification: NotificationChannel;
  order: NotificationChannel;
  payment: NotificationChannel;
  system: NotificationChannel;
  re_engagement: NotificationChannel;
  recommendation: NotificationChannel;
  content_update: NotificationChannel;
  deal: NotificationChannel;
  make_reminder: NotificationChannel;
  creator_activity: NotificationChannel;
}

interface NotificationPreferencesPanelProps {
  preferences: NotificationPreferences;
  onPreferenceChange: (type: keyof NotificationPreferences, channel: keyof NotificationChannel, value: boolean) => void;
  onSave: () => void;
  isSaving?: boolean;
}

const notificationTypes = [
  {
    key: 'milestone' as const,
    label: 'Milestone Achievements',
    description: 'Get notified when you reach progress milestones',
    icon: Trophy,
    category: 'Achievements'
  },
  {
    key: 'badge' as const,
    label: 'Badge Unlocks',
    description: 'Alerts when you unlock new badges',
    icon: Trophy,
    category: 'Achievements'
  },
  {
    key: 'leaderboard' as const,
    label: 'Leaderboard Rankings',
    description: 'Updates about your leaderboard position',
    icon: TrendingUp,
    category: 'Achievements'
  },
  {
    key: 'order' as const,
    label: 'Order Updates',
    description: 'Status updates for your orders',
    icon: ShoppingCart,
    category: 'Commerce'
  },
  {
    key: 'payment' as const,
    label: 'Payment Notifications',
    description: 'Payment confirmations and receipts',
    icon: CreditCard,
    category: 'Commerce'
  },
  {
    key: 'deal' as const,
    label: 'Special Deals',
    description: 'Exclusive offers and promotions',
    icon: Gift,
    category: 'Commerce'
  },
  {
    key: 'welcome' as const,
    label: 'Welcome Messages',
    description: 'Onboarding and welcome notifications',
    icon: UserPlus,
    category: 'Account'
  },
  {
    key: 'security' as const,
    label: 'Security Alerts',
    description: 'Important security-related notifications',
    icon: Shield,
    category: 'Account'
  },
  {
    key: 'verification' as const,
    label: 'Verification',
    description: 'Account verification notifications',
    icon: Shield,
    category: 'Account'
  },
  {
    key: 'engagement' as const,
    label: 'Engagement Updates',
    description: 'Community engagement notifications',
    icon: Heart,
    category: 'Social'
  },
  {
    key: 're_engagement' as const,
    label: 'Re-engagement Reminders',
    description: 'Reminders to stay active',
    icon: Bell,
    category: 'Social'
  },
  {
    key: 'creator_activity' as const,
    label: 'Creator Activity',
    description: 'Updates from creators you follow',
    icon: Users,
    category: 'Social'
  },
  {
    key: 'recommendation' as const,
    label: 'Recommendations',
    description: 'Personalized content recommendations',
    icon: MessageSquare,
    category: 'Content'
  },
  {
    key: 'content_update' as const,
    label: 'Content Updates',
    description: 'New content and feature announcements',
    icon: Bell,
    category: 'Content'
  },
  {
    key: 'make_reminder' as const,
    label: 'Reminders',
    description: 'Scheduled reminders and alerts',
    icon: Clock,
    category: 'Content'
  },
  {
    key: 'subscription' as const,
    label: 'Subscription Updates',
    description: 'Subscription status and renewals',
    icon: Bell,
    category: 'System'
  },
  {
    key: 'system' as const,
    label: 'System Notifications',
    description: 'Important system messages',
    icon: Bell,
    category: 'System'
  },
];

const groupByCategory = (types: typeof notificationTypes) => {
  const grouped: Record<string, typeof notificationTypes> = {};
  types.forEach((type) => {
    if (!grouped[type.category]) {
      grouped[type.category] = [];
    }
    grouped[type.category].push(type);
  });
  return grouped;
};

export const NotificationPreferencesPanel: React.FC<NotificationPreferencesPanelProps> = ({
  preferences,
  onPreferenceChange,
  onSave,
  isSaving = false,
}) => {
  const groupedTypes = groupByCategory(notificationTypes);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Customize how you receive notifications for different types of events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(groupedTypes).map(([category, types]) => (
          <div key={category} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{category}</h3>
              <Separator className="mb-4" />
            </div>
            
            <div className="space-y-6">
              {types.map((type) => {
                const Icon = type.icon;
                const typePrefs = preferences[type.key];
                
                return (
                  <div key={type.key} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base font-medium text-foreground">
                              {type.label}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {type.description}
                            </p>
                          </div>
                          {(type.key === 'milestone' || type.key === 'badge' || type.key === 'leaderboard') && (
                            <EmailTemplatePreview type={type.key} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`${type.key}-email`} className="text-sm font-normal">
                            Email
                          </Label>
                        </div>
                        <Switch
                          id={`${type.key}-email`}
                          checked={typePrefs?.email ?? true}
                          onCheckedChange={(checked) => onPreferenceChange(type.key, 'email', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`${type.key}-toast`} className="text-sm font-normal">
                            Toast
                          </Label>
                        </div>
                        <Switch
                          id={`${type.key}-toast`}
                          checked={typePrefs?.toast ?? true}
                          onCheckedChange={(checked) => onPreferenceChange(type.key, 'toast', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`${type.key}-in-app`} className="text-sm font-normal">
                            In-App
                          </Label>
                        </div>
                        <Switch
                          id={`${type.key}-in-app`}
                          checked={typePrefs?.in_app ?? true}
                          onCheckedChange={(checked) => onPreferenceChange(type.key, 'in_app', checked)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <div className="flex justify-end pt-4">
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
