import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface EmailTemplatePreviewProps {
  type: 'milestone' | 'badge' | 'leaderboard';
}

const sampleData = {
  milestone: {
    username: 'Sample User',
    achievementType: 'milestone' as const,
    achievementTitle: '50% Onboarding Complete!',
    achievementDescription: 'You\'ve completed half of your onboarding journey as a Creator.',
    achievementData: {
      role: 'creator',
      completedCount: 5,
      totalCount: 10,
      progressPercentage: 50,
    },
  },
  badge: {
    username: 'Sample User',
    achievementType: 'badge' as const,
    achievementTitle: 'Legendary Badge Unlocked!',
    achievementDescription: 'You\'ve unlocked the "Master Creator" badge for exceptional performance.',
    achievementData: {
      role: 'creator',
      badgeRarity: 'legendary',
    },
  },
  leaderboard: {
    username: 'Sample User',
    achievementType: 'leaderboard' as const,
    achievementTitle: 'Top 3 Leaderboard Position!',
    achievementDescription: 'Congratulations! You\'ve reached the top 3 in the Creator leaderboard.',
    achievementData: {
      role: 'creator',
      rank: 2,
      completionTime: 7200,
    },
  },
};

const getEmoji = (type: 'milestone' | 'badge' | 'leaderboard', data?: any) => {
  if (type === 'milestone') return '🎯';
  if (type === 'badge') {
    if (data?.badgeRarity === 'legendary') return '👑';
    if (data?.badgeRarity === 'epic') return '⚡';
    if (data?.badgeRarity === 'rare') return '🌟';
    return '✨';
  }
  if (type === 'leaderboard') {
    if (data?.rank === 1) return '🥇';
    if (data?.rank === 2) return '🥈';
    if (data?.rank === 3) return '🥉';
    return '🏆';
  }
  return '🎉';
};

const roleLabels: Record<string, string> = {
  creator: 'Creator',
  artisan: 'Artisan',
  manufacturer: 'Manufacturer',
  buyer: 'Customer',
};

const formatTime = (seconds?: number) => {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({ type }) => {
  const data = sampleData[type];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
        >
          <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-border/50 shadow-2xl">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            Email Preview
          </DialogTitle>
          <DialogDescription className="text-base">
            Preview how <span className="font-semibold text-foreground">{data.achievementTitle}</span> notification will appear in your inbox
          </DialogDescription>
        </DialogHeader>
        
        {/* Email Preview */}
        <div className="border-2 border-border/50 rounded-xl overflow-hidden shadow-inner bg-muted/20">
          <div style={{
            backgroundColor: '#f6f9fc',
            fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              margin: '0 auto',
              padding: '20px 0 48px',
              maxWidth: '600px',
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '64px', lineHeight: '64px', margin: '0 0 16px' }}>
                  {getEmoji(type, data.achievementData)}
                </div>
                <h1 style={{
                  color: '#333',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  margin: '0',
                  padding: '0',
                }}>
                  Achievement Unlocked!
                </h1>
              </div>

              {/* Content */}
              <div style={{ padding: '0 48px' }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#333',
                  margin: '0 0 24px',
                }}>
                  Hi {data.username},
                </p>
                
                {/* Achievement Box */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '24px',
                  margin: '24px 0',
                  border: '2px solid #e9ecef',
                }}>
                  <h2 style={{
                    color: '#333',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '0 0 8px',
                  }}>
                    {data.achievementTitle}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#666',
                    margin: '0 0 16px',
                  }}>
                    {data.achievementDescription}
                  </p>
                  
                  {data.achievementData.role && (
                    <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666', margin: '8px 0' }}>
                      <strong>Role:</strong> {roleLabels[data.achievementData.role]}
                    </p>
                  )}
                  
                  {'completedCount' in data.achievementData && data.achievementData.completedCount !== undefined && (
                    <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666', margin: '8px 0' }}>
                      <strong>Tasks Completed:</strong> {data.achievementData.completedCount}/{data.achievementData.totalCount}
                      {' '}({data.achievementData.progressPercentage}%)
                    </p>
                  )}
                  
                  {'rank' in data.achievementData && data.achievementData.rank && (
                    <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666', margin: '8px 0' }}>
                      <strong>Leaderboard Rank:</strong> #{data.achievementData.rank}
                    </p>
                  )}
                  
                  {'completionTime' in data.achievementData && data.achievementData.completionTime && (
                    <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666', margin: '8px 0' }}>
                      <strong>Completion Time:</strong> {formatTime(data.achievementData.completionTime)}
                    </p>
                  )}
                  
                  {'badgeRarity' in data.achievementData && data.achievementData.badgeRarity && (
                    <p style={{ fontSize: '14px', lineHeight: '20px', color: '#666', margin: '8px 0' }}>
                      <strong>Rarity:</strong> {data.achievementData.badgeRarity.charAt(0).toUpperCase() + data.achievementData.badgeRarity.slice(1)}
                    </p>
                  )}
                </div>

                <p style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#333',
                  margin: '24px 0',
                }}>
                  Keep up the great work! Continue your journey and unlock even more achievements.
                </p>

                {/* Button */}
                <div style={{ textAlign: 'center', margin: '32px 0' }}>
                  <a href="#" style={{
                    backgroundColor: '#5469d4',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    display: 'inline-block',
                    padding: '12px 32px',
                  }}>
                    View Your Dashboard
                  </a>
                </div>
              </div>

              <hr style={{ borderColor: '#e6ebf1', margin: '32px 0' }} />

              {/* Footer */}
              <div style={{ padding: '0 48px' }}>
                <p style={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#8898aa',
                  textAlign: 'center',
                  margin: '8px 0',
                }}>
                  You're receiving this email because you achieved a milestone in your onboarding journey.
                </p>
                <p style={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#8898aa',
                  textAlign: 'center',
                  margin: '8px 0',
                }}>
                  © {new Date().getFullYear()} OpenTeknologies. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
