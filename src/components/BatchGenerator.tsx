import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, X, Wand2 } from 'lucide-react';
import { Character, GenerationJob } from '@/types';
import { toast } from 'sonner';

interface BatchGeneratorProps {
  characters: Character[];
  onGenerate: (job: Omit<GenerationJob, 'id' | 'createdAt' | 'status'>) => void;
  isGenerating: boolean;
}

interface BatchPrompt {
  id: string;
  prompt: string;
  characterId?: string;
  variations: number;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({
  characters,
  onGenerate,
  isGenerating
}) => {
  const [batchPrompts, setBatchPrompts] = useState<BatchPrompt[]>([
    { id: crypto.randomUUID(), prompt: '', variations: 1 }
  ]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('none');

  const addPrompt = () => {
    setBatchPrompts(prev => [
      ...prev,
      { id: crypto.randomUUID(), prompt: '', variations: 1 }
    ]);
  };

  const removePrompt = (id: string) => {
    setBatchPrompts(prev => prev.filter(p => p.id !== id));
  };

  const updatePrompt = (id: string, updates: Partial<BatchPrompt>) => {
    setBatchPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleBatchGenerate = async () => {
    const validPrompts = batchPrompts.filter(p => p.prompt.trim());
    
    if (validPrompts.length === 0) {
      toast.error('Please add at least one prompt');
      return;
    }

    const totalJobs = validPrompts.reduce((sum, p) => sum + p.variations, 0);
    
    if (totalJobs > 10) {
      toast.error('Maximum 10 images per batch generation');
      return;
    }

    toast.success(`Starting batch generation of ${totalJobs} images...`);

    // Generate jobs for each prompt and variation
    for (const batchPrompt of validPrompts) {
      for (let i = 0; i < batchPrompt.variations; i++) {
        const characterId = batchPrompt.characterId && batchPrompt.characterId !== 'none' 
          ? batchPrompt.characterId 
          : selectedCharacter !== 'none' ? selectedCharacter : undefined;

        await onGenerate({
          characterId,
          prompt: batchPrompt.prompt.trim(),
          seed: undefined,
          useReference: false,
          referenceImageUrl: undefined,
          aspectRatio: '1:1',
          outputFormat: 'png',
          promptUpsampling: true,
          safetyTolerance: 2
        });

        // Small delay between generations to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const totalImages = batchPrompts.reduce((sum, p) => sum + (p.variations || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Batch Generator
        </h2>
        <p className="text-muted-foreground">Generate multiple images from different prompts at once</p>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-foreground">Batch Generation</CardTitle>
              <CardDescription>Create multiple variations from different prompts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Default Character (Optional)</Label>
              <Badge variant="secondary">
                {totalImages} image{totalImages !== 1 ? 's' : ''} total
              </Badge>
            </div>
            <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select default character..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No character</SelectItem>
                {characters.map(character => (
                  <SelectItem key={character.id} value={character.id}>
                    {character.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Prompts</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addPrompt}
                disabled={batchPrompts.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Prompt
              </Button>
            </div>

            <div className="space-y-3">
              {batchPrompts.map((batchPrompt, index) => (
                <Card key={batchPrompt.id} className="bg-background border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          {batchPrompts.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePrompt(batchPrompt.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        <Textarea
                          value={batchPrompt.prompt}
                          onChange={(e) => updatePrompt(batchPrompt.id, { prompt: e.target.value })}
                          placeholder="Enter your prompt..."
                          className="bg-background border-border min-h-[80px] resize-none"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Variations</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={batchPrompt.variations}
                              onChange={(e) => updatePrompt(batchPrompt.id, { 
                                variations: Math.max(1, Math.min(5, parseInt(e.target.value) || 1))
                              })}
                              className="bg-background border-border"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Character Override</Label>
                            <Select 
                              value={batchPrompt.characterId || 'default'} 
                              onValueChange={(value) => updatePrompt(batchPrompt.id, { 
                                characterId: value === 'default' ? undefined : value 
                              })}
                            >
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">Use Default</SelectItem>
                                <SelectItem value="none">No Character</SelectItem>
                                {characters.map(character => (
                                  <SelectItem key={character.id} value={character.id}>
                                    {character.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="hero"
              size="lg"
              onClick={handleBatchGenerate}
              disabled={isGenerating || totalImages === 0 || totalImages > 10}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate {totalImages} Image{totalImages !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};