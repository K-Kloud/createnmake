import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.3';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { AchievementEmail } from './_templates/achievement-email.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AchievementNotificationRequest {
  userId: string;
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      userId,
      achievementType,
      achievementTitle,
      achievementDescription,
      achievementData = {},
    }: AchievementNotificationRequest = await req.json();

    console.log('Processing achievement notification:', {
      userId,
      achievementType,
      achievementTitle,
    });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, email:id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('User profile not found');
    }

    // Get user email from auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !user?.email) {
      console.error('Error fetching user email:', authError);
      throw new Error('User email not found');
    }

    const username = profile.username || 'Champion';
    const dashboardUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/onboarding/progress`;

    // Render email template
    const html = await renderAsync(
      React.createElement(AchievementEmail, {
        username,
        achievementType,
        achievementTitle,
        achievementDescription,
        achievementData,
        dashboardUrl,
      })
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: 'OpenTeknologies <onboarding@resend.dev>',
      to: [user.email],
      subject: `${achievementTitle} - Achievement Unlocked! 🎉`,
      html,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the notification in audit logs
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'achievement_email_sent',
      action_details: {
        achievement_type: achievementType,
        achievement_title: achievementTitle,
        email_id: emailResponse.data?.id,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.data?.id,
        message: 'Achievement notification sent successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-achievement-email function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
