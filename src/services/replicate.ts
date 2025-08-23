import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface GenerateImageParams {
  prompt: string;
  input_image?: string;
  aspect_ratio?: "1:1" | "16:9" | "21:9" | "2:3" | "3:2" | "4:5" | "5:4" | "9:16" | "9:21" | "match_input_image";
  output_format?: "png" | "jpg" | "webp";
  safety_tolerance?: number;
  prompt_upsampling?: boolean;
  seed?: number;
}

export interface GeneratedImageResponse {
  imageURL: string;
  prompt: string;
  seed?: number;
  predictionId: string;
}

export class ReplicateService {
  constructor() {
    // No longer needs API key since it's handled by the edge function
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImageResponse> {
    try {
      toast.info("Starting image generation...");

      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: params
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to call image generation service");
      }

      if (!data) {
        throw new Error("No data received from generation service");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.imageURL) {
        throw new Error("No image URL received from generation service");
      }

      toast.success("Image generated successfully!");

      return {
        imageURL: data.imageURL,
        prompt: params.prompt,
        seed: params.seed || data.seed,
        predictionId: data.predictionId || crypto.randomUUID(),
      };
    } catch (error) {
      console.error("Replicate generation error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate image";
      toast.error(`Generation failed: ${message}`);
      throw error;
    }
  }

  async cancelGeneration(predictionId: string): Promise<void> {
    // Since we're using edge functions, we can't actually cancel generations
    // but we'll still provide the interface for compatibility
    toast.info("Generation marked as canceled");
  }
}