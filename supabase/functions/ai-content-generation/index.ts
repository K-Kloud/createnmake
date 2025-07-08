
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, content_type, prompt, user_id, parameters } = await req.json();

    console.log('AI Content Generation request:', { action, content_type, user_id });

    switch (action) {
      case 'generate_product_description':
        return await generateProductDescription(prompt, parameters, OPENAI_API_KEY, supabaseClient);
      
      case 'create_marketing_copy':
        return await createMarketingCopy(prompt, parameters, OPENAI_API_KEY, supabaseClient);
      
      case 'generate_seo_content':
        return await generateSEOContent(prompt, parameters, OPENAI_API_KEY, supabaseClient);
      
      case 'create_social_media_posts':
        return await createSocialMediaPosts(prompt, parameters, OPENAI_API_KEY, supabaseClient);
      
      case 'generate_email_templates':
        return await generateEmailTemplates(prompt, parameters, OPENAI_API_KEY, supabaseClient);
      
      case 'enhance_prompt':
        return await enhancePrompt(prompt, parameters, OPENAI_API_KEY);
        
      case 'generate_tags':
        return await generateTags(prompt, OPENAI_API_KEY);
        
      case 'generate_recommendations':
        return await generateRecommendations(parameters, supabaseClient);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('AI Content Generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function generateProductDescription(prompt: string, parameters: any, apiKey: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Generate compelling product descriptions for fashion items. Include:
          - Engaging headline
          - Detailed description highlighting features and benefits
          - Material and care instructions
          - Size and fit information
          - Style suggestions
          Make it persuasive and SEO-friendly.`
        },
        {
          role: 'user',
          content: `Product: ${prompt}
          Target audience: ${parameters?.target_audience || 'general'}
          Style: ${parameters?.style || 'casual'}
          Price range: ${parameters?.price_range || 'mid-range'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Store generated content
  await supabase
    .from('generated_content')
    .insert({
      content_type: 'product_description',
      content_data: { prompt, content, parameters },
      user_id: parameters?.user_id,
      created_at: new Date().toISOString()
    });

  return new Response(
    JSON.stringify({ content }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createMarketingCopy(prompt: string, parameters: any, apiKey: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Create compelling marketing copy that converts. Include:
          - Attention-grabbing headlines
          - Benefit-focused content
          - Strong call-to-action
          - Emotional appeal
          - Social proof elements
          Keep it concise and persuasive.`
        },
        {
          role: 'user',
          content: `Campaign: ${prompt}
          Campaign type: ${parameters?.campaign_type || 'general'}
          Channel: ${parameters?.channel || 'email'}
          Goal: ${parameters?.goal || 'conversion'}`
        }
      ],
      temperature: 0.8,
      max_tokens: 600,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  await supabase
    .from('generated_content')
    .insert({
      content_type: 'marketing_copy',
      content_data: { prompt, content, parameters },
      user_id: parameters?.user_id,
      created_at: new Date().toISOString()
    });

  return new Response(
    JSON.stringify({ content }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateSEOContent(prompt: string, parameters: any, apiKey: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Create SEO-optimized content including:
          - SEO-friendly title (under 60 characters)
          - Meta description (under 160 characters)
          - H1, H2, H3 headings
          - Keyword-optimized content
          - Internal linking suggestions
          - Featured snippet optimization`
        },
        {
          role: 'user',
          content: `Topic: ${prompt}
          Primary keyword: ${parameters?.primary_keyword || prompt}
          Secondary keywords: ${parameters?.secondary_keywords?.join(', ') || 'fashion, design, custom'}
          Content length: ${parameters?.content_length || 'medium'}`
        }
      ],
      temperature: 0.6,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  await supabase
    .from('generated_content')
    .insert({
      content_type: 'seo_content',
      content_data: { prompt, content, parameters },
      user_id: parameters?.user_id,
      created_at: new Date().toISOString()
    });

  return new Response(
    JSON.stringify({ content }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createSocialMediaPosts(prompt: string, parameters: any, apiKey: string, supabase: any) {
  const platforms = parameters?.platforms || ['instagram', 'facebook', 'twitter'];
  const posts: Record<string, string> = {};

  for (const platform of platforms) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Create engaging social media posts for ${platform}. Consider:
            - Platform-specific character limits and features
            - Appropriate hashtags and mentions
            - Visual content suggestions
            - Engagement hooks
            - Call-to-action
            Keep it authentic and shareable.`
          },
          {
            role: 'user',
            content: `Content theme: ${prompt}
            Brand voice: ${parameters?.brand_voice || 'friendly'}
            Target audience: ${parameters?.target_audience || 'young adults'}
            Campaign goal: ${parameters?.campaign_goal || 'engagement'}`
          }
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    posts[platform] = data.choices[0].message.content;
  }

  await supabase
    .from('generated_content')
    .insert({
      content_type: 'social_media_posts',
      content_data: { prompt, content: posts, parameters },
      user_id: parameters?.user_id,
      created_at: new Date().toISOString()
    });

  return new Response(
    JSON.stringify({ posts }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateEmailTemplates(prompt: string, parameters: any, apiKey: string, supabase: any) {
  const emailTypes = parameters?.email_types || ['welcome', 'promotional', 'follow_up'];
  const templates: Record<string, any> = {};

  for (const emailType of emailTypes) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Create a professional email template for ${emailType} emails. Include:
            - Compelling subject line
            - Personalized greeting
            - Clear and engaging body content
            - Strong call-to-action
            - Professional signature
            - Mobile-friendly structure`
          },
          {
            role: 'user',
            content: `Email purpose: ${prompt}
            Email type: ${emailType}
            Brand tone: ${parameters?.brand_tone || 'professional'}
            Target segment: ${parameters?.target_segment || 'customers'}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the content to extract subject and body
    const lines = content.split('\n');
    const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'))?.replace(/subject:/i, '').trim() || 'Welcome!';
    const bodyContent = content;

    templates[emailType] = {
      subject: subjectLine,
      body: bodyContent
    };
  }

  await supabase
    .from('generated_content')
    .insert({
      content_type: 'email_templates',
      content_data: { prompt, content: templates, parameters },
      user_id: parameters?.user_id,
      created_at: new Date().toISOString()
    });

  return new Response(
    JSON.stringify({ templates }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
