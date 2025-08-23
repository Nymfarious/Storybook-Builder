import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Wand2, Sparkles, Settings } from 'lucide-react';
import { Character, GenerationJob } from '@/types';
import { toast } from 'sonner';

interface ImageGeneratorProps {
  characters: Character[];
  onGenerate: (job: Omit<GenerationJob, 'id' | 'createdAt' | 'status'>) => void;
  isGenerating: boolean;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  characters,
  onGenerate,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('none');
  const [seed, setSeed] = useState<string>('');
  const [useReference, setUseReference] = useState(false);
  const [selectedReferenceIndices, setSelectedReferenceIndices] = useState<number[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [promptUpsampling, setPromptUpsampling] = useState(true);
  const [safetyTolerance, setSafetyTolerance] = useState(2);

  const selectedChar = characters.find(c => c.id === selectedCharacter && selectedCharacter !== 'none');
  const canUseReference = selectedChar && selectedChar.referenceImages.length > 0;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    let referenceImageUrl: string | undefined;
    
    if (useReference && selectedChar && selectedReferenceIndices.length > 0) {
      if (selectedReferenceIndices.length === 1) {
        // Single image - use directly
        referenceImageUrl = selectedChar.referenceImages[selectedReferenceIndices[0]];
      } else {
        // Multiple images - create composite
        referenceImageUrl = await createCompositeImage(
          selectedReferenceIndices.map(index => selectedChar.referenceImages[index])
        );
      }
    }

    onGenerate({
      characterId: selectedCharacter === 'none' ? undefined : selectedCharacter || undefined,
      prompt: prompt.trim(),
      seed: seed ? parseInt(seed) : undefined,
      useReference: useReference && !!referenceImageUrl,
      referenceImageUrl,
      aspectRatio: aspectRatio as any,
      outputFormat: outputFormat as any,
      promptUpsampling,
      safetyTolerance
    });

    toast.success('Image generation started!');
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
  };

  const createCompositeImage = async (imageUrls: string[]): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Set canvas size
      canvas.width = 1024;
      canvas.height = 1024;
      
      let loadedImages = 0;
      const images: HTMLImageElement[] = [];
      
      imageUrls.forEach((url, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          images[index] = img;
          loadedImages++;
          
          if (loadedImages === imageUrls.length) {
            // Draw images in a grid
            const cols = Math.ceil(Math.sqrt(imageUrls.length));
            const rows = Math.ceil(imageUrls.length / cols);
            const cellWidth = canvas.width / cols;
            const cellHeight = canvas.height / rows;
            
            images.forEach((img, i) => {
              if (img) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = col * cellWidth;
                const y = row * cellHeight;
                
                ctx.drawImage(img, x, y, cellWidth, cellHeight);
              }
            });
            
            resolve(canvas.toDataURL('image/png'));
          }
        };
        img.src = url;
      });
    });
  };

  const toggleReferenceSelection = (index: number) => {
    setSelectedReferenceIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const selectAllReferences = () => {
    if (selectedChar) {
      setSelectedReferenceIndices(selectedChar.referenceImages.map((_, index) => index));
    }
  };

  const clearReferenceSelection = () => {
    setSelectedReferenceIndices([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          AI Image Generator
        </h2>
        <p className="text-muted-foreground">Generate stunning images with Replicate's Flux Kontext Pro</p>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-foreground">Generate New Image</CardTitle>
              <CardDescription>Create AI art using your characters and prompts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="bg-background border-border min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="character">Character (Optional)</Label>
                <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a character..." />
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seed" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Seed (Optional)
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateRandomSeed}
                    className="text-primary hover:text-primary-glow"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Random
                  </Button>
                </div>
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Leave empty for random seed"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Settings
                </Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="aspect-ratio" className="text-sm">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                        <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                        <SelectItem value="4:5">Portrait (4:5)</SelectItem>
                        <SelectItem value="5:4">Landscape (5:4)</SelectItem>
                        <SelectItem value="3:2">Photo (3:2)</SelectItem>
                        <SelectItem value="2:3">Portrait Photo (2:3)</SelectItem>
                        <SelectItem value="21:9">Ultrawide (21:9)</SelectItem>
                        <SelectItem value="9:21">Tall (9:21)</SelectItem>
                        {useReference && <SelectItem value="match_input_image">Match Reference</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="output-format" className="text-sm">Output Format</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPEG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt-upsampling" className="text-sm">Automatic Prompt Enhancement</Label>
                  <Switch
                    id="prompt-upsampling"
                    checked={promptUpsampling}
                    onCheckedChange={setPromptUpsampling}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="safety-tolerance" className="text-sm">
                    Safety Tolerance: {safetyTolerance}
                  </Label>
                  <input
                    id="safety-tolerance"
                    type="range"
                    min="0"
                    max={useReference ? "2" : "6"}
                    value={safetyTolerance}
                    onChange={(e) => setSafetyTolerance(parseInt(e.target.value))}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Strict</span>
                    <span>Permissive</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedChar && (
                <Card className="bg-background border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-foreground">{selectedChar.name}</CardTitle>
                    {selectedChar.notes && (
                      <CardDescription className="text-xs">{selectedChar.notes}</CardDescription>
                    )}
                  </CardHeader>
                  {canUseReference && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                         <div className="flex items-center justify-between">
                           <Label htmlFor="use-reference" className="text-sm">Use Reference Image</Label>
                           <Switch
                             id="use-reference"
                             checked={useReference}
                             onCheckedChange={setUseReference}
                           />
                         </div>

                          {useReference && (
                            <>
                              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="text-xs text-primary font-medium">
                                  ✨ Reference images will guide the AI generation
                                </p>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs text-muted-foreground">Select Reference Images</Label>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={selectAllReferences}
                                      className="text-xs h-6 px-2"
                                    >
                                      All
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={clearReferenceSelection}
                                      className="text-xs h-6 px-2"
                                    >
                                      Clear
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {selectedChar.referenceImages.map((image, index) => (
                                    <div
                                      key={index}
                                      className={`relative cursor-pointer rounded border-2 transition-all duration-200 ${
                                        selectedReferenceIndices.includes(index)
                                          ? 'border-primary shadow-glow ring-2 ring-primary/20' 
                                          : 'border-border hover:border-primary/50'
                                      }`}
                                      onClick={() => toggleReferenceSelection(index)}
                                    >
                                      <img
                                        src={image}
                                        alt={`Reference ${index + 1}`}
                                        className="w-full h-16 object-cover rounded"
                                      />
                                      {selectedReferenceIndices.includes(index) && (
                                        <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                                          <div className="w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground flex items-center justify-center">
                                            <span className="text-xs font-bold text-primary-foreground">
                                              {selectedReferenceIndices.indexOf(index) + 1}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {selectedReferenceIndices.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                      Selected: {selectedReferenceIndices.length} image{selectedReferenceIndices.length > 1 ? 's' : ''}
                                    </p>
                                    {selectedReferenceIndices.length > 1 && (
                                      <p className="text-xs text-primary">
                                        Multiple images will be combined into a composite reference
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {!selectedChar && characters.length > 0 && (
                <Card className="bg-muted/20 border-dashed border-border">
                  <CardContent className="text-center py-8">
                    <Wand2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Select a character to use reference images
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="hero"
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  {useReference && selectedChar ? 'Generating with reference...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};