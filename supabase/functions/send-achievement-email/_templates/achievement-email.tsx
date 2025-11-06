import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface AchievementEmailProps {
  username: string;
  achievementType: 'milestone' | 'badge' | 'leaderboard';
  achievementTitle: string;
  achievementDescription: string;
  achievementData?: {
    role?: string;
    completedCount?: number;
    totalCount?: number;
    progressPercentage?: number;
    rank?: number;
    completionTime?: number;
    badgeRarity?: string;
  };
  dashboardUrl: string;
}

export const AchievementEmail = ({
  username,
  achievementType,
  achievementTitle,
  achievementDescription,
  achievementData = {},
  dashboardUrl,
}: AchievementEmailProps) => {
  const roleLabels: Record<string, string> = {
    creator: 'Creator',
    artisan: 'Artisan',
    manufacturer: 'Manufacturer',
    buyer: 'Customer',
  };

  const getEmoji = () => {
    if (achievementType === 'milestone') return '🎯';
    if (achievementType === 'badge') {
      if (achievementData.badgeRarity === 'legendary') return '👑';
      if (achievementData.badgeRarity === 'epic') return '⚡';
      if (achievementData.badgeRarity === 'rare') return '🌟';
      return '✨';
    }
    if (achievementType === 'leaderboard') {
      if (achievementData.rank === 1) return '🥇';
      if (achievementData.rank === 2) return '🥈';
      if (achievementData.rank === 3) return '🥉';
      return '🏆';
    }
    return '🎉';
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Html>
      <Head />
      <Preview>
        {achievementTitle} - You've unlocked a new achievement!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={emoji}>{getEmoji()}</Text>
            <Heading style={h1}>Achievement Unlocked!</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {username},</Text>
            
            <Section style={achievementBox}>
              <Heading style={h2}>{achievementTitle}</Heading>
              <Text style={description}>{achievementDescription}</Text>
              
              {achievementData.role && (
                <Text style={detail}>
                  <strong>Role:</strong> {roleLabels[achievementData.role]}
                </Text>
              )}
              
              {achievementData.completedCount !== undefined && (
                <Text style={detail}>
                  <strong>Tasks Completed:</strong> {achievementData.completedCount}/{achievementData.totalCount}
                  {' '}({achievementData.progressPercentage}%)
                </Text>
              )}
              
              {achievementData.rank && (
                <Text style={detail}>
                  <strong>Leaderboard Rank:</strong> #{achievementData.rank}
                </Text>
              )}
              
              {achievementData.completionTime && (
                <Text style={detail}>
                  <strong>Completion Time:</strong> {formatTime(achievementData.completionTime)}
                </Text>
              )}
              
              {achievementData.badgeRarity && (
                <Text style={detail}>
                  <strong>Rarity:</strong> {achievementData.badgeRarity.charAt(0).toUpperCase() + achievementData.badgeRarity.slice(1)}
                </Text>
              )}
            </Section>

            <Text style={text}>
              Keep up the great work! Continue your journey and unlock even more achievements.
            </Text>

            <Section style={buttonContainer}>
              <Link href={dashboardUrl} style={button}>
                View Your Dashboard
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you achieved a milestone in your onboarding journey.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} OpenTeknologies. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AchievementEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
};

const emoji = {
  fontSize: '64px',
  lineHeight: '64px',
  margin: '0 0 16px',
};

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const content = {
  padding: '0 48px',
};

const greeting = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333',
  margin: '0 0 24px',
};

const achievementBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #e9ecef',
};

const description = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#666',
  margin: '0 0 16px',
};

const detail = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#666',
  margin: '8px 0',
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333',
  margin: '24px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#8898aa',
  textAlign: 'center' as const,
  margin: '8px 0',
};
