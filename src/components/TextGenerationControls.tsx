import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';

interface TextGenerationControlsProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  onGenerateText: () => void;
}

export const TextGenerationControls: React.FC<TextGenerationControlsProps> = ({
  aiPrompt,
  setAiPrompt,
  onGenerateText
}) => {
  return (
    <div className="space-y-3 border border-border rounded-lg p-3">
      <Label className="text-sm font-medium">AI Text Generation</Label>
      
      <div className="space-y-2">
        <Label className="text-xs">Generation Prompt</Label>
        <Textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={2}
          placeholder="Describe what text you want to generate..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">Style</Label>
          <Select value="narration" onValueChange={() => {}}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dialogue">Dialogue</SelectItem>
              <SelectItem value="narration">Narration</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="action">Action</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Tone</Label>
          <Select value="dramatic" onValueChange={() => {}}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dramatic">Dramatic</SelectItem>
              <SelectItem value="humorous">Humorous</SelectItem>
              <SelectItem value="mysterious">Mysterious</SelectItem>
              <SelectItem value="romantic">Romantic</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs">Length</Label>
        <Select value="medium" onValueChange={() => {}}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Short (1-2 sentences)</SelectItem>
            <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
            <SelectItem value="long">Long (4-6 sentences)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button onClick={onGenerateText} size="sm" variant="outline" className="w-full">
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Story Text
      </Button>
    </div>
  );
};