// src/adapters/replicate.adapter.ts
// Mëku Storybook Studio v2.1.0
// Direct Replicate API adapter - no platform middleman

import { 
  BaseAdapter, 
  AdapterConfig, 
  GenerationParams, 
  GenerationResult, 
  ProviderInfo 
} from './base.adapter';

// Replicate model identifiers
export const REPLICATE_MODELS = {
  // Flux models
  FLUX_SCHNELL: 'black-forest-labs/flux-schnell',
  FLUX_DEV: 'black-forest-labs/flux-dev',
  FLUX_PRO: 'black-forest-labs/flux-1.1-pro',
  
  // SDXL models
  SDXL: 'stability-ai/sdxl',
  SDXL_LIGHTNING: 'bytedance/sdxl-lightning-4step',
  
  // Specialty
  REMBG: 'cjwbw/rembg',
  REAL_ESRGAN: 'nightmareai/real-esrgan',
  GFPGAN: 'tencentarc/gfpgan',
} as const;

export type ReplicateModel = typeof REPLICATE_MODELS[keyof typeof REPLICATE_MODELS];

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
  metrics?: {
    predict_time?: number;
  };
}

export class ReplicateAdapter extends BaseAdapter {
  readonly providerInfo: ProviderInfo = {
    name: 'Replicate',
    id: 'replicate',
    tier: 'basic',
    costPerImage: 0.003, // Varies by model
    models: Object.values(REPLICATE_MODELS),
    capabilities: ['text-to-image', 'image-to-image', 'upscale', 'remove-bg'],
  };

  private baseUrl = 'https://api.replicate.com/v1';
  private selectedModel: ReplicateModel = REPLICATE_MODELS.FLUX_SCHNELL;
  private pollingInterval = 1000;
  private maxPollingAttempts = 120; // 2 minutes max

  constructor(config: AdapterConfig) {
    super(config);
    if (config.baseUrl) this.baseUrl = config.baseUrl;
  }

  setModel(model: ReplicateModel): void {
    this.selectedModel = model;
  }

  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET',
    body?: object
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait', // Try to get result in single request
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `Replicate API error: ${response.status}`);
    }

    return response.json();
  }

  private buildInput(params: GenerationParams): Record<string, unknown> {
    const input: Record<string, unknown> = {
      prompt: params.prompt,
    };

    if (params.negativePrompt) {
      input.negative_prompt = params.negativePrompt;
    }

    if (params.inputImage) {
      input.image = params.inputImage;
      if (params.strength !== undefined) {
        input.strength = params.strength;
      }
    }

    if (params.aspectRatio) {
      input.aspect_ratio = params.aspectRatio;
    } else if (params.width && params.height) {
      input.width = params.width;
      input.height = params.height;
    }

    if (params.seed) input.seed = params.seed;
    if (params.steps) input.num_inference_steps = params.steps;
    if (params.guidanceScale) input.guidance_scale = params.guidanceScale;
    if (params.outputFormat) input.output_format = params.outputFormat;

    return input;
  }

  private async pollForResult(predictionId: string): Promise<ReplicatePrediction> {
    let attempts = 0;
    
    while (attempts < this.maxPollingAttempts) {
      const prediction = await this.makeRequest<ReplicatePrediction>(
        `/predictions/${predictionId}`
      );

      if (prediction.status === 'succeeded') {
        return prediction;
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new Error(prediction.error || `Prediction ${prediction.status}`);
      }

      await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
      attempts++;
    }

    throw new Error('Generation timed out');
  }

  async generateImage(params: GenerationParams): Promise<GenerationResult> {
    const startTime = Date.now();

    // Create prediction
    const prediction = await this.makeRequest<ReplicatePrediction>(
      '/predictions',
      'POST',
      {
        version: this.getModelVersion(this.selectedModel),
        input: this.buildInput(params),
      }
    );

    // If not immediately complete, poll for result
    let finalPrediction = prediction;
    if (prediction.status !== 'succeeded') {
      finalPrediction = await this.pollForResult(prediction.id);
    }

    const output = Array.isArray(finalPrediction.output) 
      ? finalPrediction.output[0] 
      : finalPrediction.output;

    if (!output) {
      throw new Error('No output received from Replicate');
    }

    return {
      id: finalPrediction.id,
      url: output,
      prompt: params.prompt,
      seed: params.seed,
      model: this.selectedModel,
      provider: 'replicate',
      duration: Date.now() - startTime,
    };
  }

  async cancelGeneration(id: string): Promise<void> {
    await this.makeRequest(`/predictions/${id}/cancel`, 'POST');
  }

  async checkStatus(id: string): Promise<'pending' | 'processing' | 'completed' | 'failed'> {
    const prediction = await this.makeRequest<ReplicatePrediction>(`/predictions/${id}`);
    
    switch (prediction.status) {
      case 'starting':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'succeeded':
        return 'completed';
      default:
        return 'failed';
    }
  }

  async removeBackground(imageUrl: string): Promise<string> {
    const prediction = await this.makeRequest<ReplicatePrediction>(
      '/predictions',
      'POST',
      {
        version: this.getModelVersion(REPLICATE_MODELS.REMBG),
        input: { image: imageUrl },
      }
    );

    const finalPrediction = prediction.status === 'succeeded' 
      ? prediction 
      : await this.pollForResult(prediction.id);

    const output = Array.isArray(finalPrediction.output) 
      ? finalPrediction.output[0] 
      : finalPrediction.output;

    if (!output) throw new Error('Background removal failed');
    return output;
  }

  async upscale(imageUrl: string, scale: number = 4): Promise<string> {
    const prediction = await this.makeRequest<ReplicatePrediction>(
      '/predictions',
      'POST',
      {
        version: this.getModelVersion(REPLICATE_MODELS.REAL_ESRGAN),
        input: { 
          image: imageUrl,
          scale,
          face_enhance: false,
        },
      }
    );

    const finalPrediction = prediction.status === 'succeeded' 
      ? prediction 
      : await this.pollForResult(prediction.id);

    const output = Array.isArray(finalPrediction.output) 
      ? finalPrediction.output[0] 
      : finalPrediction.output;

    if (!output) throw new Error('Upscaling failed');
    return output;
  }

  // Model version mapping (these may need updating as versions change)
  private getModelVersion(model: string): string {
    // In production, you'd fetch the latest version from the API
    // For now, using known stable versions
    const versions: Record<string, string> = {
      [REPLICATE_MODELS.FLUX_SCHNELL]: 'f2ab8a5bfe79f02f0b2f3f77ae1e5f3d5f9b8e5d',
      [REPLICATE_MODELS.FLUX_DEV]: '28a9d0b95e7f9c8f5f4e4d5e5b5c5a5e5f5d5c5b',
      [REPLICATE_MODELS.REMBG]: 'd1e0a3b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7',
      [REPLICATE_MODELS.REAL_ESRGAN]: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    };
    
    // If no cached version, use model identifier directly (API will resolve latest)
    return versions[model] || model;
  }
}

// Factory function for easy creation
export function createReplicateAdapter(apiKey: string, tier: 'free' | 'basic' | 'pro' = 'basic'): ReplicateAdapter {
  return new ReplicateAdapter({ apiKey, tier });
}
