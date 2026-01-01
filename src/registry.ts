// src/adapters/registry.ts
// Mëku Storybook Studio v2.1.0
// Provider registry for hot-swappable AI services

import { BaseAdapter, ProviderInfo, GenerationParams, GenerationResult } from './base.adapter';
import { ReplicateAdapter, REPLICATE_MODELS, createReplicateAdapter } from './replicate.adapter';

// Provider capability types
export type ProviderCapability = 
  | 'text-to-image' 
  | 'image-to-image' 
  | 'upscale' 
  | 'remove-bg'
  | 'video'
  | 'tts'
  | 'voice-clone'
  | 'talking-avatar';

// Registry entry
interface ProviderEntry {
  adapter: BaseAdapter;
  info: ProviderInfo;
  enabled: boolean;
  priority: number; // Lower = preferred
}

// User's API key configuration
export interface ApiKeyConfig {
  replicate?: string;
  elevenlabs?: string;
  gemini?: string;
  openai?: string;
  firefly?: string;
}

// Cost tier for selecting providers
export type CostTier = 'cheapest' | 'balanced' | 'quality';

class ProviderRegistry {
  private providers: Map<string, ProviderEntry> = new Map();
  private capabilityIndex: Map<ProviderCapability, string[]> = new Map();

  // Initialize registry with user's API keys
  initialize(keys: ApiKeyConfig): void {
    this.providers.clear();
    this.capabilityIndex.clear();

    // Register Replicate if key provided
    if (keys.replicate) {
      const adapter = createReplicateAdapter(keys.replicate);
      this.register('replicate', adapter, 1);
    }

    // Future: Add other providers
    // if (keys.elevenlabs) { ... }
    // if (keys.gemini) { ... }
  }

  // Register a provider
  register(id: string, adapter: BaseAdapter, priority: number = 10): void {
    const entry: ProviderEntry = {
      adapter,
      info: adapter.providerInfo,
      enabled: true,
      priority,
    };

    this.providers.set(id, entry);

    // Index by capability
    for (const cap of adapter.providerInfo.capabilities) {
      const capability = cap as ProviderCapability;
      const existing = this.capabilityIndex.get(capability) || [];
      existing.push(id);
      this.capabilityIndex.set(capability, existing);
    }
  }

  // Get provider by ID
  getProvider(id: string): BaseAdapter | null {
    const entry = this.providers.get(id);
    return entry?.enabled ? entry.adapter : null;
  }

  // Get best provider for a capability
  getProviderForCapability(
    capability: ProviderCapability, 
    costTier: CostTier = 'balanced'
  ): BaseAdapter | null {
    const providerIds = this.capabilityIndex.get(capability) || [];
    
    if (providerIds.length === 0) return null;

    // Sort by priority and cost preference
    const sorted = providerIds
      .map(id => this.providers.get(id)!)
      .filter(entry => entry.enabled)
      .sort((a, b) => {
        if (costTier === 'cheapest') {
          return (a.info.costPerImage || 0) - (b.info.costPerImage || 0);
        }
        if (costTier === 'quality') {
          // Assume higher cost = better quality
          return (b.info.costPerImage || 0) - (a.info.costPerImage || 0);
        }
        // Balanced: use priority
        return a.priority - b.priority;
      });

    return sorted[0]?.adapter || null;
  }

  // List all available providers
  listProviders(): ProviderInfo[] {
    return Array.from(this.providers.values())
      .filter(entry => entry.enabled)
      .map(entry => entry.info);
  }

  // Enable/disable provider
  setEnabled(id: string, enabled: boolean): void {
    const entry = this.providers.get(id);
    if (entry) entry.enabled = enabled;
  }

  // Quick generation using best available provider
  async generateImage(
    params: GenerationParams, 
    costTier: CostTier = 'balanced'
  ): Promise<GenerationResult> {
    const capability: ProviderCapability = params.inputImage 
      ? 'image-to-image' 
      : 'text-to-image';
    
    const provider = this.getProviderForCapability(capability, costTier);
    
    if (!provider) {
      throw new Error(`No provider available for ${capability}. Please add an API key.`);
    }

    return provider.generateImage(params);
  }

  // Check if any generation capability is available
  hasGenerationCapability(): boolean {
    return this.capabilityIndex.has('text-to-image') || 
           this.capabilityIndex.has('image-to-image');
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();

// Storage key for API keys (encrypted in real implementation)
const STORAGE_KEY = 'meku-api-keys';

// Load saved API keys from localStorage
export function loadApiKeys(): ApiKeyConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load API keys:', e);
  }
  return {};
}

// Save API keys to localStorage
export function saveApiKeys(keys: ApiKeyConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  providerRegistry.initialize(keys);
}

// Initialize on load
if (typeof window !== 'undefined') {
  const keys = loadApiKeys();
  providerRegistry.initialize(keys);
}
