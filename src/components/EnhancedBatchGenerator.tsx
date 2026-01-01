import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, X, Play, Pause, Settings, ChevronDown, Copy, Wand2, AlertCircle } from 'lucide-react';
import { Character, GenerationJob } from '@/types';
import { toast } from 'sonner';

interface BatchPrompt {
  id: string;
  prompt: string;
  characterId?: string;
  seed?: number;
  aspectRatio?: string;
  outputFormat?: string;
  promptUpsampling?: boolean;
  safetyTolerance?: number;
  referenceImageUrl?: string;
  negativePrompt?: string;
  guidanceScale?: number;
  inferenceSteps?: number;
  imageStrength?: number;
  useAdvanced: boolean;
}

interface BatchGeneratorProps {
  characters: Character[];
  onStartGeneration: (jobs: GenerationJob[]) => void;
  isGenerating: boolean;
  generationQueue: GenerationJob[];
}

const DEFAULT_BATCH_PROMPT = (): BatchPrompt => ({
  id: crypto.randomUUID(),
  prompt: '',
  useAdvanced: false,
  aspectRatio: '1:1',
  outputFormat: 'webp',
  promptUpsampling: true,
  safetyTolerance: 2,
  guidanceScale: 7.5,
  inferenceSteps: 30,
  imageStrength: 0.8
});

export const EnhancedBatchGenerator: React.FC<BatchGeneratorProps> = ({
  characters,
  onStartGeneration,
  isGenerating,
  generationQueue
}) => {
  const [batchPrompts, setBatchPrompts] = useState<BatchPrompt[]>([DEFAULT_BATCH_PROMPT()]);
  const [defaultSettings, setDefaultSettings] = useState({
    aspectRatio: '1:1',
    outputFormat: 'webp',
    promptUpsampling: true,
    safetyTolerance: 2,
    guidanceScale: 7.5,
    inferenceSteps: 30,
    imageStrength: 0.8
  });

  const addPrompt = () => {
    setBatchPrompts(prev => [...prev, DEFAULT_BATCH_PROMPT()]);
  };

  const removePrompt = (id: string) => {
    if (batchPrompts.length > 1) {
      setBatchPrompts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updatePrompt = (id: string, updates: Partial<BatchPrompt>) => {
    setBatchPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const duplicatePrompt = (id: string) => {
    const prompt = batchPrompts.find(p => p.id === id);
    if (prompt) {
      const duplicated = { ...prompt, id: crypto.randomUUID() };
      setBatchPrompts(prev => [...prev, duplicated]);
    }
  };

  const applyDefaultsToAll = () => {
    setBatchPrompts(prev => prev.map(p => ({
      ...p,
      ...defaultSettings,
      useAdvanced: false
    })));
    toast.success('Default settings applied to all prompts');
  };

  const handleStartGeneration = () => {
    const validPrompts = batchPrompts.filter(p => p.prompt.trim());
    
    if (validPrompts.length === 0) {
      toast.error('Please add at least one prompt');
      return;
    }

    const jobs: GenerationJob[] = validPrompts.map(prompt => ({
      id: crypto.randomUUID(),
      characterId: prompt.characterId,
      prompt: prompt.prompt,
      seed: prompt.seed,
      useReference: !!prompt.referenceImageUrl,
      referenceImageUrl: prompt.referenceImageUrl,
      aspectRatio: (prompt.useAdvanced ? prompt.aspectRatio : defaultSettings.aspectRatio) as any,
      outputFormat: (prompt.useAdvanced ? prompt.outputFormat : defaultSettings.outputFormat) as any,
      promptUpsampling: prompt.useAdvanced ? prompt.promptUpsampling : defaultSettings.promptUpsampling,
      safetyTolerance: prompt.useAdvanced ? prompt.safetyTolerance : defaultSettings.safetyTolerance,
      status: 'pending',
      createdAt: new Date()
    }));

    onStartGeneration(jobs);
    toast.success(`Started batch generation with ${jobs.length} prompts`);
  };

  const getCharacterName = (characterId?: string) => {
    if (!characterId) return undefined;
    return characters.find(c => c.id === characterId)?.name;
  };

  const completedJobs = generationQueue.filter(j => j.status === 'completed').length;
  const failedJobs = generationQueue.filter(j => j.status === 'failed').length;

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Enhanced Batch Generator
        </CardTitle>
        {generationQueue.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">
              {completedJobs}/{generationQueue.length} completed
            </Badge>
            {failedJobs > 0 && (
              <Badge variant="destructive">
                {failedJobs} failed
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Settings */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Default Settings
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Select 
                  value={defaultSettings.aspectRatio} 
                  onValueChange={(value) => setDefaultSettings(prev => ({ ...prev, aspectRatio: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="4:3">Standard (4:3)</SelectItem>
                    <SelectItem value="3:2">Photo (3:2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select 
                  value={defaultSettings.outputFormat} 
                  onValueChange={(value) => setDefaultSettings(prev => ({ ...prev, outputFormat: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPEG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Guidance Scale: {defaultSettings.guidanceScale}</Label>
                <Slider
                  value={[defaultSettings.guidanceScale]}
                  onValueChange={([value]) => setDefaultSettings(prev => ({ ...prev, guidanceScale: value }))}
                  min={1}
                  max={20}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <Label>Inference Steps: {defaultSettings.inferenceSteps}</Label>
                <Slider
                  value={[defaultSettings.inferenceSteps]}
                  onValueChange={([value]) => setDefaultSettings(prev => ({ ...prev, inferenceSteps: value }))}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={defaultSettings.promptUpsampling}
                  onCheckedChange={(checked) => setDefaultSettings(prev => ({ ...prev, promptUpsampling: checked }))}
                />
                <Label>Prompt Upsampling</Label>
              </div>
              <Button onClick={applyDefaultsToAll} size="sm" variant="outline">
                Apply to All
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Batch Prompts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg">Batch Prompts ({batchPrompts.length})</Label>
            <Button onClick={addPrompt} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          </div>

          <ScrollArea className="h-96 w-full">
            <div className="space-y-4 pr-4">
              {batchPrompts.map((prompt, index) => (
                <Card key={prompt.id} className="bg-background border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Prompt {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicatePrompt(prompt.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {batchPrompts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrompt(prompt.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Prompt</Label>
                      <Textarea
                        value={prompt.prompt}
                        onChange={(e) => updatePrompt(prompt.id, { prompt: e.target.value })}
                        placeholder="Describe what you want to generate..."
                        className="bg-muted border-border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Character</Label>
                        <Select 
                          value={prompt.characterId || 'none'} 
                          onValueChange={(value) => updatePrompt(prompt.id, { characterId: value === 'none' ? undefined : value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Character</SelectItem>
                            {characters.map(character => (
                              <SelectItem key={character.id} value={character.id}>
                                {character.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Seed (Optional)</Label>
                        <Input
                          type="number"
                          value={prompt.seed || ''}
                          onChange={(e) => updatePrompt(prompt.id, { seed: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="Random"
                          className="bg-muted border-border"
                        />
                      </div>
                    </div>

                    {/* Advanced Settings Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={prompt.useAdvanced}
                        onCheckedChange={(checked) => updatePrompt(prompt.id, { useAdvanced: checked })}
                      />
                      <Label>Use Advanced Settings</Label>
                      {!prompt.useAdvanced && (
                        <Badge variant="outline" className="text-xs">
                          Using defaults
                        </Badge>
                      )}
                    </div>

                    {/* Advanced Settings */}
                    {prompt.useAdvanced && (
                      <Collapsible defaultOpen>
                        <CollapsibleContent className="space-y-4 border-t border-border pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Aspect Ratio</Label>
                              <Select 
                                value={prompt.aspectRatio || '1:1'} 
                                onValueChange={(value) => updatePrompt(prompt.id, { aspectRatio: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                                  <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                                  <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                                  <SelectItem value="4:3">Standard (4:3)</SelectItem>
                                  <SelectItem value="3:2">Photo (3:2)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Safety Tolerance</Label>
                              <Select 
                                value={String(prompt.safetyTolerance || 2)} 
                                onValueChange={(value) => updatePrompt(prompt.id, { safetyTolerance: parseInt(value) })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Strictest</SelectItem>
                                  <SelectItem value="1">Strict</SelectItem>
                                  <SelectItem value="2">Standard</SelectItem>
                                  <SelectItem value="3">Relaxed</SelectItem>
                                  <SelectItem value="4">Most Relaxed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Reference Image URL (Optional)</Label>
                            <Input
                              value={prompt.referenceImageUrl || ''}
                              onChange={(e) => updatePrompt(prompt.id, { referenceImageUrl: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              className="bg-muted border-border"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Negative Prompt (Optional)</Label>
                            <Textarea
                              value={prompt.negativePrompt || ''}
                              onChange={(e) => updatePrompt(prompt.id, { negativePrompt: e.target.value })}
                              placeholder="What you don't want to see..."
                              className="bg-muted border-border"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Guidance Scale: {prompt.guidanceScale || 7.5}</Label>
                              <Slider
                                value={[prompt.guidanceScale || 7.5]}
                                onValueChange={([value]) => updatePrompt(prompt.id, { guidanceScale: value })}
                                min={1}
                                max={20}
                                step={0.5}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Inference Steps: {prompt.inferenceSteps || 30}</Label>
                              <Slider
                                value={[prompt.inferenceSteps || 30]}
                                onValueChange={([value]) => updatePrompt(prompt.id, { inferenceSteps: value })}
                                min={10}
                                max={100}
                                step={5}
                              />
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Generation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>{batchPrompts.filter(p => p.prompt.trim()).length} valid prompts ready</span>
          </div>
          
          <Button 
            onClick={handleStartGeneration}
            disabled={isGenerating || batchPrompts.every(p => !p.prompt.trim())}
            className="px-6"
          >
            {isGenerating ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Batch Generation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};