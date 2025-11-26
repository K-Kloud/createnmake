import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, options = {} } = await req.json();
    
    console.log("🔍 Analyzing reference image:", imageUrl);
    console.log("📋 Analysis options:", options);

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    // Check if OpenAI API key is available for analysis
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log("⚠️ OpenAI API key not available, using fallback analysis");
      return createFallbackResponse();
    }

    // Use OpenAI Vision API to analyze the image
    const analysisPrompt = createAnalysisPrompt(options);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.error("❌ OpenAI API error:", response.status, response.statusText);
      return createFallbackResponse();
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      console.error("❌ No analysis text received from OpenAI");
      return createFallbackResponse();
    }

    // Parse the analysis response
    const analysis = parseAnalysisResponse(analysisText);
    
    console.log("✅ Image analysis completed:", analysis);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Image analysis error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: getErrorMessage(error),
        analysis: createFallbackAnalysis()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 with fallback data
      }
    );
  }
});

function createAnalysisPrompt(options: any): string {
  const tasks = [];
  
  if (options.extractColors !== false) {
    tasks.push("- Identify the 3-5 dominant colors (provide hex codes)");
  }
  
  if (options.analyzeStyle !== false) {
    tasks.push("- Describe the overall style (e.g., minimalist, vintage, modern, bohemian)");
  }
  
  if (options.detectObjects !== false) {
    tasks.push("- List the main objects/clothing items visible");
  }
  
  if (options.analyzeComposition !== false) {
    tasks.push("- Describe the composition and layout");
  }
  
  if (options.extractTexture !== false) {
    tasks.push("- Describe textures and materials visible");
  }

  return `Analyze this fashion/clothing image and provide the following information in JSON format:

${tasks.join('\n')}

Please respond with a JSON object containing:
{
  "dominantColors": ["#color1", "#color2", "#color3"],
  "style": "style description",
  "composition": "composition description", 
  "objects": ["object1", "object2"],
  "textureDescription": "texture description",
  "enhancedPrompt": "a descriptive prompt enhancement based on the image"
}`;
}

function parseAnalysisResponse(analysisText: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback parsing if JSON is not properly formatted
    return createFallbackAnalysis();
  } catch (error) {
    console.error("❌ Failed to parse analysis response:", error);
    return createFallbackAnalysis();
  }
}

function createFallbackAnalysis(): any {
  return {
    dominantColors: ["#2c3e50", "#34495e", "#95a5a6"],
    style: "contemporary",
    composition: "centered subject with balanced proportions",
    objects: ["fashion item", "clothing piece"],
    textureDescription: "smooth fabric with natural draping",
    enhancedPrompt: "contemporary fashion piece with balanced composition"
  };
}

function createFallbackResponse(): Response {
  return new Response(
    JSON.stringify({ 
      success: true, 
      analysis: createFallbackAnalysis(),
      fallback: true
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}