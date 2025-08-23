export interface Character {
  id: string;
  name: string;
  notes: string;
  referenceImages: string[];
  createdAt: Date;
}

export interface GeneratedImage {
  id: string;
  characterId?: string;
  characterName?: string;
  prompt: string;
  seed?: number;
  imageUrl: string;
  useReference: boolean;
  referenceImageUrl?: string;
  aspectRatio?: string;
  outputFormat?: string;
  promptUpsampling?: boolean;
  safetyTolerance?: number;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'canceled';
  predictionId?: string;
  createdAt: Date;
}

export interface GenerationJob {
  id: string;
  characterId?: string;
  prompt: string;
  seed?: number;
  useReference: boolean;
  referenceImageUrl?: string;
  aspectRatio?: "1:1" | "16:9" | "21:9" | "2:3" | "3:2" | "4:5" | "5:4" | "9:16" | "9:21" | "match_input_image";
  outputFormat?: "png" | "jpg" | "webp";
  promptUpsampling?: boolean;
  safetyTolerance?: number;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'canceled';
  imageUrl?: string;
  predictionId?: string;
  createdAt: Date;
}