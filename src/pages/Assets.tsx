import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CharacterManager } from '@/components/CharacterManager';
import UserMenu from '@/components/UserMenu';
import { Character } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Assets = () => {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCharacters = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedCharacters: Character[] = data.map(char => ({
        id: char.id,
        name: char.name,
        notes: char.notes || '',
        referenceImages: char.reference_images || [],
        createdAt: new Date(char.created_at)
      }));

      setCharacters(mappedCharacters);
    } catch (error) {
      console.error('Error loading characters:', error);
      toast.error('Failed to load characters');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const addCharacter = useCallback(async (characterData: Omit<Character, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error('Please log in to save characters');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('characters')
        .insert({
          user_id: user.id,
          name: characterData.name,
          notes: characterData.notes,
          reference_images: characterData.referenceImages
        })
        .select()
        .single();

      if (error) throw error;

      const newCharacter: Character = {
        id: data.id,
        name: data.name,
        notes: data.notes || '',
        referenceImages: data.reference_images || [],
        createdAt: new Date(data.created_at)
      };

      setCharacters(prev => [newCharacter, ...prev]);
      toast.success(`Character "${newCharacter.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Failed to create character');
    }
  }, [user]);

  const deleteCharacter = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCharacters(prev => prev.filter(c => c.id !== id));
      toast.success('Character deleted successfully!');
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error('Failed to delete character');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to manage your assets.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Loading Assets...</h2>
            <p className="text-muted-foreground">Please wait while we load your characters.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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