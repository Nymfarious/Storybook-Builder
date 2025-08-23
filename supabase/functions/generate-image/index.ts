import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateImageRequest {
  prompt: string;
  input_image?: string;
  aspect_ratio?: "1:1" | "16:9" | "21:9" | "2:3" | "3:2" | "4:5" | "5:4" | "9:16" | "9:21" | "match_input_image";
  output_format?: "png" | "jpg" | "webp";
  safety_tolerance?: number;
  prompt_upsampling?: boolean;
  seed?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
    if (!REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN is not set')
      throw new Error('REPLICATE_API_TOKEN is not configured')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    })

    const body: GenerateImageRequest = await req.json()

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

    console.log("Generating image with parameters:", {
      prompt: body.prompt,
      aspect_ratio: body.aspect_ratio,
      has_input_image: !!body.input_image,
      output_format: body.output_format,
      safety_tolerance: body.safety_tolerance,
      prompt_upsampling: body.prompt_upsampling,
      seed: body.seed
    })

    // Build input parameters for Flux Kontext Pro
    const input: any = {
      prompt: body.prompt,
      aspect_ratio: body.aspect_ratio || "1:1",
      output_format: body.output_format || "png",
      safety_tolerance: body.safety_tolerance ?? 2,
      prompt_upsampling: body.prompt_upsampling ?? true,
    }

    // Add input image if provided
    if (body.input_image) {
      input.input_image = body.input_image
    }

    // Add seed if provided
    if (body.seed) {
      input.seed = body.seed
    }

    console.log("Starting image generation with Flux Kontext Pro...")
    const output = await replicate.run(
      "black-forest-labs/flux-kontext-pro",
      { input }
    )

    console.log("Generation successful, output received")
    
    // The output should be a string URL for the generated image
    const imageURL = Array.isArray(output) ? output[0] : output;
    
    return new Response(JSON.stringify({ 
      imageURL,
      prompt: body.prompt,
      seed: body.seed,
      predictionId: crypto.randomUUID() // Generate a fake prediction ID for compatibility
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in generate-image function:", error)
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate image" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})