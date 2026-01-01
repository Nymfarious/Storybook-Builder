// src/components/MiniDevTools/panels/AgentsPanel.tsx
// Mëku Storybook Studio v2.1.0
// AI Agent Console - Test prompts with Claude, Gemini, etc.

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Loader2, Trash2, Copy, Check, Sparkles } from 'lucide-react';
import { useApiKeysStore, ApiProvider } from '@/stores/apiKeysStore';
import { logDevEvent } from '@/stores/devLogsStore';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  provider: ApiProvider;
  description: string;
  systemPrompt?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agent: string;
  tokens?: number;
}

const AGENTS: Agent[] = [
  {
    id: 'story-helper',
    name: 'Story Helper',
    provider: 'anthropic',
    description: 'Helps develop plot, characters, and narrative structure',
    systemPrompt: 'You are a creative writing assistant helping develop stories for children. Be encouraging and imaginative.',
  },
  {
    id: 'grammar-cop',
    name: 'Grammar Cop',
    provider: 'anthropic',
    description: 'Checks grammar, style, and consistency',
    systemPrompt: 'You are an editor. Check the text for grammar, style, and suggest improvements. Be concise.',
  },
  {
    id: 'image-prompter',
    name: 'Image Prompter',
    provider: 'google',
    description: 'Creates detailed prompts for AI image generation',
    systemPrompt: 'You create detailed image generation prompts. Include style, composition, lighting, mood.',
  },
  {
    id: 'narrator',
    name: 'Narrator Voice',
    provider: 'elevenlabs',
    description: 'Suggests narration styles and pacing',
    systemPrompt: 'You help with narration. Suggest pacing, emphasis, and emotional delivery.',
  },
];

export function AgentsPanel() {
  const { hasKey, getKey } = useApiKeysStore();
  const [selectedAgent, setSelectedAgent] = useState<string>(AGENTS[0].id);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent)!;
  const providerReady = hasKey(currentAgent.provider);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim() || !providerReady) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      agent: currentAgent.name,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    logDevEvent('info', `Prompt sent to ${currentAgent.name}`, { prompt: prompt.slice(0, 50) }, 'Agent');

    try {
      let response = '';

      switch (currentAgent.provider) {
        case 'anthropic': {
          const key = getKey('anthropic');
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': key!,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307',
              max_tokens: 500,
              system: currentAgent.systemPrompt,
              messages: [{ role: 'user', content: prompt }],
            }),
          });
          const data = await res.json();
          response = data.content?.[0]?.text || data.error?.message || 'No response';
          break;
        }

        case 'google': {
          const key = getKey('google');
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${currentAgent.systemPrompt}\n\nUser: ${prompt}` }] }],
              }),
            }
          );
          const data = await res.json();
          response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
          break;
        }

        default:
          response = `[${currentAgent.name}] Provider "${currentAgent.provider}" not yet implemented for live calls. Add your API key in the APIs panel.`;
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        agent: currentAgent.name,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      logDevEvent('info', `Response from ${currentAgent.name}`, { length: response.length }, 'Agent');
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        agent: currentAgent.name,
      };
      setMessages((prev) => [...prev, errorMessage]);
      logDevEvent('error', `Agent error: ${error}`, undefined, 'Agent');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Agent Selection */}
      <Card className="bg-card/50 border-border flex-shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Select Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGENTS.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <span>{agent.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {agent.provider}
                    </Badge>
                    {!hasKey(agent.provider) && (
                      <span className="text-xs text-muted-foreground">(no key)</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">{currentAgent.description}</p>

          {!providerReady && (
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
              Add your {currentAgent.provider} API key in the APIs panel to use this agent.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat History */}
      <Card className="bg-card/50 border-border flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-2 flex-shrink-0 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Console
          </CardTitle>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="h-6 text-xs">
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Send a prompt to get started
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'rounded-lg p-3 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary/10 border border-primary/20 ml-8'
                        : 'bg-muted/50 border border-border mr-8'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {msg.role === 'user' ? 'You' : msg.agent}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleCopy(msg.content, msg.id)}
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2 mt-3 flex-shrink-0">
            <Textarea
              placeholder={providerReady ? 'Enter your prompt...' : 'Add API key first...'}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[60px] max-h-[100px] bg-background/50 resize-none"
              disabled={loading || !providerReady}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !prompt.trim() || !providerReady}
              className="self-end"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ctrl+Enter to send</p>
        </CardContent>
      </Card>
    </div>
  );
}
