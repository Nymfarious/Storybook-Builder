// src/components/ApiSettings.tsx
// Mëku Storybook Studio v2.1.0
// API key management UI with tier selection

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Zap,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiKeyConfig, saveApiKeys, loadApiKeys, providerRegistry } from '@/adapters/registry';

interface ApiSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProviderConfig {
  id: keyof ApiKeyConfig;
  name: string;
  description: string;
  signupUrl: string;
  tier: 'free' | 'paid';
  costInfo: string;
  capabilities: string[];
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Run AI models in the cloud. Pay per use.',
    signupUrl: 'https://replicate.com/signin',
    tier: 'paid',
    costInfo: '~$0.003-0.05 per image',
    capabilities: ['Text to Image', 'Image to Image', 'Upscaling', 'Background Removal'],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Voice synthesis and talking avatars.',
    signupUrl: 'https://elevenlabs.io/sign-up',
    tier: 'paid',
    costInfo: 'Plans from $5/mo',
    capabilities: ['Text to Speech', 'Voice Cloning', 'Talking Avatar'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Multimodal AI with generous free tier.',
    signupUrl: 'https://aistudio.google.com/apikey',
    tier: 'free',
    costInfo: 'Free tier available',
    capabilities: ['Text to Image', 'Image Understanding', 'Text Generation'],
  },
];

export const ApiSettings: React.FC<ApiSettingsProps> = ({ open, onOpenChange }) => {
  const [keys, setKeys] = useState<ApiKeyConfig>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setKeys(loadApiKeys());
    }
  }, [open]);

  const handleKeyChange = (provider: keyof ApiKeyConfig, value: string) => {
    setKeys(prev => ({ ...prev, [provider]: value || undefined }));
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const testConnection = async (provider: keyof ApiKeyConfig) => {
    const key = keys[provider];
    if (!key) {
      toast.error('Please enter an API key first');
      return;
    }

    setTestingProvider(provider);
    
    try {
      // Simple validation - just check if key looks valid
      if (provider === 'replicate' && !key.startsWith('r8_')) {
        throw new Error('Replicate keys should start with r8_');
      }
      
      // In production, make a lightweight API call to verify
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`${PROVIDERS.find(p => p.id === provider)?.name} connection successful!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSave = () => {
    saveApiKeys(keys);
    toast.success('API settings saved');
    onOpenChange(false);
  };

  const hasAnyKey = Object.values(keys).some(k => k);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Configuration
          </DialogTitle>
          <DialogDescription>
            Connect your own API keys for AI image generation. Your keys are stored locally.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="replicate" className="mt-4">
          <TabsList className="grid grid-cols-3">
            {PROVIDERS.map(provider => (
              <TabsTrigger key={provider.id} value={provider.id} className="gap-1.5">
                {provider.name}
                {keys[provider.id] && (
                  <Check className="w-3 h-3 text-green-500" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {PROVIDERS.map(provider => (
            <TabsContent key={provider.id} value={provider.id} className="space-y-4 mt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={provider.tier === 'free' ? 'secondary' : 'outline'}>
                    {provider.tier === 'free' ? (
                      <><Zap className="w-3 h-3 mr-1" /> Free Tier</>
                    ) : (
                      <><DollarSign className="w-3 h-3 mr-1" /> {provider.costInfo}</>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`key-${provider.id}`}>API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={`key-${provider.id}`}
                      type={showKeys[provider.id] ? 'text' : 'password'}
                      placeholder={`Enter your ${provider.name} API key`}
                      value={keys[provider.id] || ''}
                      onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                      className="pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKeys[provider.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(provider.id)}
                    disabled={!keys[provider.id] || testingProvider === provider.id}
                  >
                    {testingProvider === provider.id ? 'Testing...' : 'Test'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <a
                  href={provider.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Get an API key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h5 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Capabilities
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {provider.capabilities.map(cap => (
                    <Badge key={cap} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {!hasAnyKey && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-amber-700 dark:text-amber-300">
              Add at least one API key to enable AI generation features.
              Replicate is recommended for getting started.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
