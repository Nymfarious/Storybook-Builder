// src/stores/apiKeysStore.ts
// Mëku Storybook Studio v2.1.0
// Centralized API key management with localStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logDevEvent } from './devLogsStore';

export type ApiProvider = 
  | 'replicate' 
  | 'anthropic' 
  | 'google' 
  | 'elevenlabs' 
  | 'openai'
  | 'supabase';

export interface ProviderConfig {
  id: ApiProvider;
  name: string;
  description: string;
  signupUrl: string;
  docsUrl: string;
  tier: 'free' | 'freemium' | 'paid';
  capabilities: string[];
  keyPrefix?: string; // e.g., "sk-" for OpenAI
}

export const PROVIDERS: Record<ApiProvider, ProviderConfig> = {
  replicate: {
    id: 'replicate',
    name: 'Replicate',
    description: 'ML model hosting - FLUX, SDXL, RemBG, upscaling',
    signupUrl: 'https://replicate.com',
    docsUrl: 'https://replicate.com/docs',
    tier: 'freemium',
    capabilities: ['text-to-image', 'image-to-image', 'upscale', 'remove-bg', 'video'],
    keyPrefix: 'r8_',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    description: 'Advanced reasoning, story generation, code assistance',
    signupUrl: 'https://console.anthropic.com',
    docsUrl: 'https://docs.anthropic.com',
    tier: 'paid',
    capabilities: ['text-generation', 'reasoning', 'code', 'analysis'],
    keyPrefix: 'sk-ant-',
  },
  google: {
    id: 'google',
    name: 'Google AI (Gemini)',
    description: 'Multimodal generation, image understanding',
    signupUrl: 'https://aistudio.google.com',
    docsUrl: 'https://ai.google.dev/docs',
    tier: 'freemium',
    capabilities: ['text-generation', 'text-to-image', 'image-understanding', 'video'],
  },
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Text-to-speech, voice cloning, narration',
    signupUrl: 'https://elevenlabs.io',
    docsUrl: 'https://docs.elevenlabs.io',
    tier: 'freemium',
    capabilities: ['tts', 'voice-clone', 'talking-avatar'],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models, DALL-E, Whisper',
    signupUrl: 'https://platform.openai.com',
    docsUrl: 'https://platform.openai.com/docs',
    tier: 'paid',
    capabilities: ['text-generation', 'text-to-image', 'stt', 'tts'],
    keyPrefix: 'sk-',
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    description: 'Auth, database, storage (configured via env)',
    signupUrl: 'https://supabase.com',
    docsUrl: 'https://supabase.com/docs',
    tier: 'freemium',
    capabilities: ['auth', 'database', 'storage', 'edge-functions'],
  },
};

interface ApiKeysState {
  keys: Partial<Record<ApiProvider, string>>;
  connectionStatus: Partial<Record<ApiProvider, 'untested' | 'testing' | 'connected' | 'failed'>>;
  
  // Actions
  setKey: (provider: ApiProvider, key: string) => void;
  removeKey: (provider: ApiProvider) => void;
  getKey: (provider: ApiProvider) => string | undefined;
  hasKey: (provider: ApiProvider) => boolean;
  testConnection: (provider: ApiProvider) => Promise<boolean>;
  getAvailableProviders: () => ApiProvider[];
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      keys: {},
      connectionStatus: {},

      setKey: (provider, key) => {
        set((state) => ({
          keys: { ...state.keys, [provider]: key },
          connectionStatus: { ...state.connectionStatus, [provider]: 'untested' },
        }));
        logDevEvent('info', `API key set for ${provider}`, undefined, 'ApiKeys');
      },

      removeKey: (provider) => {
        set((state) => {
          const { [provider]: removed, ...rest } = state.keys;
          return { 
            keys: rest,
            connectionStatus: { ...state.connectionStatus, [provider]: 'untested' },
          };
        });
        logDevEvent('info', `API key removed for ${provider}`, undefined, 'ApiKeys');
      },

      getKey: (provider) => get().keys[provider],

      hasKey: (provider) => {
        const key = get().keys[provider];
        return !!key && key.length > 0;
      },

      testConnection: async (provider) => {
        set((state) => ({
          connectionStatus: { ...state.connectionStatus, [provider]: 'testing' },
        }));

        const key = get().keys[provider];
        if (!key) {
          set((state) => ({
            connectionStatus: { ...state.connectionStatus, [provider]: 'failed' },
          }));
          logDevEvent('warn', `No API key for ${provider}`, undefined, 'ApiKeys');
          return false;
        }

        try {
          // Provider-specific test endpoints
          let success = false;

          switch (provider) {
            case 'replicate':
              // Test Replicate by fetching account info
              const replicateRes = await fetch('https://api.replicate.com/v1/account', {
                headers: { 'Authorization': `Token ${key}` },
              });
              success = replicateRes.ok;
              break;

            case 'anthropic':
              // Test Claude with a minimal request
              // Note: This costs tokens, so we just validate key format
              success = key.startsWith('sk-ant-') && key.length > 20;
              break;

            case 'google':
              // Test Gemini with models list
              const googleRes = await fetch(
                `https://generativelanguage.googleapis.com/v1/models?key=${key}`
              );
              success = googleRes.ok;
              break;

            case 'elevenlabs':
              // Test ElevenLabs with user info
              const elevenRes = await fetch('https://api.elevenlabs.io/v1/user', {
                headers: { 'xi-api-key': key },
              });
              success = elevenRes.ok;
              break;

            case 'openai':
              // Test OpenAI with models list
              const openaiRes = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${key}` },
              });
              success = openaiRes.ok;
              break;

            default:
              success = key.length > 10;
          }

          set((state) => ({
            connectionStatus: { 
              ...state.connectionStatus, 
              [provider]: success ? 'connected' : 'failed' 
            },
          }));

          logDevEvent(
            success ? 'info' : 'error',
            `Connection test ${success ? 'passed' : 'failed'} for ${provider}`,
            undefined,
            'ApiKeys'
          );

          return success;
        } catch (error) {
          set((state) => ({
            connectionStatus: { ...state.connectionStatus, [provider]: 'failed' },
          }));
          logDevEvent('error', `Connection test error for ${provider}: ${error}`, undefined, 'ApiKeys');
          return false;
        }
      },

      getAvailableProviders: () => {
        const state = get();
        return Object.keys(state.keys).filter(
          (p) => state.keys[p as ApiProvider]
        ) as ApiProvider[];
      },
    }),
    {
      name: 'meku-api-keys',
      // Don't persist connection status
      partialize: (state) => ({ keys: state.keys }),
    }
  )
);
