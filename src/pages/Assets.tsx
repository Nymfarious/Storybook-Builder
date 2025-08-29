import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CharacterManager } from '@/components/CharacterManager';
import UserMenu from '@/components/UserMenu';
import { Character } from '@/types';
import { toast } from 'sonner';

const Assets = () => {
  const [characters, setCharacters] = useState<Character[]>([]);

  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'createdAt'>) => {
    const newCharacter: Character = {
      ...characterData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setCharacters(prev => [...prev, newCharacter]);
    toast.success(`Character "${newCharacter.name}" created successfully!`);
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    toast.success('Character deleted successfully!');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Assets Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your characters, props, and other creative assets
            </p>
          </div>
          <UserMenu />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <CharacterManager 
                characters={characters} 
                onAddCharacter={addCharacter} 
                onDeleteCharacter={deleteCharacter} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Props & Objects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Props Manager Coming Soon</h3>
                <p>Upload and manage objects, vehicles, weapons, and other props for your stories.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backgrounds & Environments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Environment Manager Coming Soon</h3>
                <p>Organize backgrounds, locations, and environmental assets.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assets;