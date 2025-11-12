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
    <Card className="glass-card border-border/50 shadow-lg dark:shadow-primary/5 dark:bg-gradient-to-br dark:from-card/95 dark:to-card/80">
      <CardHeader className="space-y-3 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 backdrop-blur-sm dark:shadow-lg dark:shadow-primary/10">
            <Bell className="h-6 w-6 text-primary dark:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 dark:from-foreground dark:to-primary/90 bg-clip-text">
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-base mt-1 dark:text-muted-foreground/80">
              Customize how you receive notifications for different types of events
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-10">
        {Object.entries(groupedTypes).map(([category, types], categoryIndex) => (
          <div 
            key={category} 
            className="space-y-6 animate-fade-in"
            style={{ animationDelay: `${categoryIndex * 100}ms` }}
          >
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-accent dark:from-primary/90 dark:to-accent/90 rounded-full dark:shadow-[0_0_12px_hsl(var(--primary)/0.4)]" />
                <h3 className="text-xl font-bold text-foreground dark:text-foreground/95 tracking-tight">
                  {category}
                </h3>
              </div>
            </div>
            
            <div className="space-y-5">
              {types.map((type, typeIndex) => {
                const Icon = type.icon;
                const typePrefs = preferences[type.key];
                
                return (
                  <div 
                    key={type.key} 
                    className="group relative p-5 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-primary/30 dark:bg-gradient-to-br dark:from-card/40 dark:to-card/20 dark:border-border/30 dark:hover:border-primary/50 dark:hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300 hover:shadow-md"
                    style={{ animationDelay: `${(categoryIndex * 100) + (typeIndex * 50)}ms` }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 p-2.5 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 group-hover:from-primary/25 group-hover:to-accent/20 dark:from-primary/25 dark:to-accent/20 dark:group-hover:from-primary/40 dark:group-hover:to-accent/30 dark:shadow-inner transition-all duration-300">
                          <Icon className="h-5 w-5 text-primary dark:drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <Label className="text-base font-semibold text-foreground cursor-pointer">
                                {type.label}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                                {type.description}
                              </p>
                            </div>
                            {(type.key === 'milestone' || type.key === 'badge' || type.key === 'leaderboard') && (
                              <EmailTemplatePreview type={type.key} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pl-14 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 dark:bg-muted/20 dark:hover:bg-muted/30 dark:hover:shadow-[0_0_12px_hsl(var(--primary)/0.1)] transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-md bg-background/80 dark:bg-background/60 dark:shadow-inner">
                              <Mail className="h-3.5 w-3.5 text-primary dark:drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
                            </div>
                            <Label htmlFor={`${type.key}-email`} className="text-sm font-medium cursor-pointer dark:text-foreground/90">
                              Email
                            </Label>
                          </div>
                          <Switch
                            id={`${type.key}-email`}
                            checked={typePrefs?.email ?? true}
                            onCheckedChange={(checked) => onPreferenceChange(type.key, 'email', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 dark:bg-muted/20 dark:hover:bg-muted/30 dark:hover:shadow-[0_0_12px_hsl(var(--accent)/0.1)] transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-md bg-background/80 dark:bg-background/60 dark:shadow-inner">
                              <MessageSquare className="h-3.5 w-3.5 text-accent dark:drop-shadow-[0_0_4px_hsl(var(--accent)/0.5)]" />
                            </div>
                            <Label htmlFor={`${type.key}-toast`} className="text-sm font-medium cursor-pointer dark:text-foreground/90">
                              Toast
                            </Label>
                          </div>
                          <Switch
                            id={`${type.key}-toast`}
                            checked={typePrefs?.toast ?? true}
                            onCheckedChange={(checked) => onPreferenceChange(type.key, 'toast', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 dark:bg-muted/20 dark:hover:bg-muted/30 dark:hover:shadow-[0_0_12px_hsl(var(--secondary)/0.1)] transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-md bg-background/80 dark:bg-background/60 dark:shadow-inner">
                              <Bell className="h-3.5 w-3.5 text-secondary dark:drop-shadow-[0_0_4px_hsl(var(--secondary)/0.5)]" />
                            </div>
                            <Label htmlFor={`${type.key}-in-app`} className="text-sm font-medium cursor-pointer dark:text-foreground/90">
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
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <Separator className="my-8" />
        
        <div className="flex justify-end pt-2">
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            size="lg"
            className="min-w-[160px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl dark:shadow-primary/20 dark:hover:shadow-primary/30 dark:hover:shadow-2xl transition-all duration-300"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
