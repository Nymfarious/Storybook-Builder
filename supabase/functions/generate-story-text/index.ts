import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StoryTextRequest {
  prompt: string;
  context?: string;
  style?: 'dialogue' | 'narration' | 'description' | 'action';
  tone?: 'dramatic' | 'humorous' | 'mysterious' | 'romantic' | 'dark';
  length?: 'short' | 'medium' | 'long';
  characters?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    })

    const body: StoryTextRequest = await req.json()

    if (!body.prompt) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: prompt is required" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log("Generating story text with prompt:", body.prompt)

    // Build context-aware prompt based on parameters
    let systemPrompt = "You are a creative writer specializing in graphic novels and comics."
    let textPrompt = body.prompt

    // Add style-specific instructions
    switch (body.style) {
      case 'dialogue':
        systemPrompt += " Write natural, engaging dialogue that reveals character and advances the story."
        break
      case 'narration':
        systemPrompt += " Write descriptive narration that sets the scene and moves the story forward."
        break
      case 'description':
        systemPrompt += " Write vivid, visual descriptions that help readers imagine the scene."
        break
      case 'action':
        systemPrompt += " Write dynamic action sequences with clear, exciting prose."
        break
      default:
        systemPrompt += " Write compelling story text appropriate for a graphic novel."
    }

    // Add tone guidance
    if (body.tone) {
      const toneMap = {
        dramatic: "Use dramatic, emotional language",
        humorous: "Include humor and wit",
        mysterious: "Create suspense and intrigue",
        romantic: "Use romantic, emotional language",
        dark: "Use darker, more serious tones"
      }
      systemPrompt += ` ${toneMap[body.tone]}.`
    }

    // Add length guidance
    const lengthMap = {
      short: "Keep it concise, 1-2 sentences.",
      medium: "Write 2-4 sentences.",
      long: "Write a longer passage of 4-6 sentences."
    }
    systemPrompt += ` ${lengthMap[body.length || 'medium']}`

    // Add character context if provided
    if (body.characters && body.characters.length > 0) {
      systemPrompt += ` Include these characters: ${body.characters.join(', ')}.`
    }

    // Add existing context if provided
    if (body.context) {
      textPrompt = `Context: ${body.context}\n\nNew content: ${body.prompt}`
    }

    const output = await replicate.run(
      "meta/llama-2-70b-chat",
      {
        input: {
          system_prompt: systemPrompt,
          prompt: textPrompt,
          max_new_tokens: 200,
          temperature: 0.8,
          top_p: 0.9,
          repetition_penalty: 1.1
        }
      }
    )

    // Extract text from output (Llama returns an array of strings)
    const generatedText = Array.isArray(output) ? output.join('') : output
    
    console.log("Story text generation response:", generatedText)
    
    return new Response(JSON.stringify({ 
      text: generatedText,
      prompt: body.prompt,
      style: body.style,
      tone: body.tone
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    console.error("Error in story text generation:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate story text"
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})