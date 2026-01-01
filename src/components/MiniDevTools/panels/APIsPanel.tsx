// src/components/MiniDevTools/panels/APIsPanel.tsx
// Mëku Storybook Studio v2.1.0
// API key management with connection testing

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Key,
  Trash2
} from 'lucide-react';
import { 
  useApiKeysStore, 
  PROVIDERS, 
  ApiProvider 
} from '@/stores/apiKeysStore';
import { cn } from '@/lib/utils';

const tierColors = {
  free: 'bg-green-500/20 text-green-400 border-green-500/30',
  freemium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paid: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const statusColors = {
  untested: 'text-muted-foreground',
  testing: 'text-blue-400',
  connected: 'text-green-400',
  failed: 'text-red-400',
};

export function APIsPanel() {
  const { keys, connectionStatus, setKey, removeKey, testConnection, hasKey } = useApiKeysStore();
  const [editingKey, setEditingKey] = useState<ApiProvider | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const handleSaveKey = (provider: ApiProvider) => {
    if (keyInput.trim()) {
      setKey(provider, keyInput.trim());
      setKeyInput('');
      setEditingKey(null);
    }
  };

  const handleTestConnection = async (provider: ApiProvider) => {
    await testConnection(provider);
  };

  const getStatusIcon = (provider: ApiProvider) => {
    const status = connectionStatus[provider] || 'untested';
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const providers = Object.values(PROVIDERS);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground">API Keys</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your API keys for AI services
        </p>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => {
          const hasApiKey = hasKey(provider.id);
          const status = connectionStatus[provider.id] || 'untested';
          const isEditing = editingKey === provider.id;
          const isKeyVisible = showKey[provider.id];

          return (
            <Card key={provider.id} className="bg-card/50 border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm text-foreground">
                        {provider.name}
                      </CardTitle>
                      <Badge className={cn('text-xs border', tierColors[provider.tier])}>
                        {provider.tier}
                      </Badge>
                      {hasApiKey && (
                        <span className={cn('flex items-center gap-1 text-xs', statusColors[status])}>
                          {getStatusIcon(provider.id)}
                          {status === 'connected' && 'Connected'}
                          {status === 'failed' && 'Failed'}
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {provider.description}
                    </CardDescription>
                  </div>
                  <a
                    href={provider.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardHeader>

              <CardContent className="pt-2 space-y-3">
                {/* Capabilities */}
                <div className="flex flex-wrap gap-1">
                  {provider.capabilities.slice(0, 4).map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs py-0">
                      {cap}
                    </Badge>
                  ))}
                  {provider.capabilities.length > 4 && (
                    <Badge variant="outline" className="text-xs py-0">
                      +{provider.capabilities.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Key Input/Display */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder={provider.keyPrefix ? `${provider.keyPrefix}...` : 'Enter API key'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      className="flex-1 h-8 text-sm bg-background/50"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => handleSaveKey(provider.id)}
                      disabled={!keyInput.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => {
                        setEditingKey(null);
                        setKeyInput('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : hasApiKey ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-background/30 rounded px-2 py-1">
                      <Key className="h-3 w-3 text-muted-foreground" />
                      <code className="text-xs text-muted-foreground font-mono">
                        {isKeyVisible
                          ? keys[provider.id]
                          : `${keys[provider.id]?.slice(0, 8)}${'•'.repeat(20)}`}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-auto"
                        onClick={() => setShowKey((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                      >
                        {isKeyVisible ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => handleTestConnection(provider.id)}
                      disabled={status === 'testing'}
                    >
                      {status === 'testing' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={() => removeKey(provider.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8"
                    onClick={() => setEditingKey(provider.id)}
                  >
                    <Key className="h-3 w-3 mr-2" />
                    Add API Key
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        Keys are stored locally in your browser. Never shared.
      </p>
    </div>
  );
}
