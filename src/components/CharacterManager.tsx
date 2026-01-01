import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, X, User } from 'lucide-react';
import { Character } from '@/types';

interface CharacterManagerProps {
  characters: Character[];
  onAddCharacter: (character: Omit<Character, 'id' | 'createdAt'>) => void;
  onDeleteCharacter: (id: string) => void;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  characters,
  onAddCharacter,
  onDeleteCharacter
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', notes: '' });
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddCharacter({
      name: formData.name,
      notes: formData.notes,
      referenceImages
    });

    setFormData({ name: '', notes: '' });
    setReferenceImages([]);
    setIsCreating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file && referenceImages.length < 5) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setReferenceImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Character Management
          </h2>
          <p className="text-muted-foreground">Create and manage your AI characters</p>
        </div>
        {!isCreating && (
          <Button variant="hero" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4" />
            New Character
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Create New Character</CardTitle>
            <CardDescription>Add a character with reference images for AI generation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter character name..."
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes & Description</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Character description, traits, style notes..."
                  className="bg-background border-border min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label>Reference Images (up to 5)</Label>
                <div className="flex flex-wrap gap-3">
                  {referenceImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Reference ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-border shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {referenceImages.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="hero" disabled={!formData.name.trim()}>
                  Create Character
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map(character => (
          <Card key={character.id} className="bg-gradient-card border-border shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{character.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {character.referenceImages.length} reference image{character.referenceImages.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteCharacter(character.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            {(character.notes || character.referenceImages.length > 0) && (
              <CardContent className="pt-0">
                {character.notes && (
                  <p className="text-sm text-muted-foreground mb-3">{character.notes}</p>
                )}
                {character.referenceImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {character.referenceImages.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${character.name} ref ${index + 1}`}
                        className="w-12 h-12 object-cover rounded border border-border"
                      />
                    ))}
                    {character.referenceImages.length > 3 && (
                      <div className="w-12 h-12 bg-muted rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                        +{character.referenceImages.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {characters.length === 0 && !isCreating && (
        <Card className="bg-gradient-card border-border shadow-sm">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Characters Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first character to get started with AI image generation</p>
            <Button variant="hero" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4" />
              Create First Character
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};