import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Search, Filter, Download, Heart, Star, Trash2, Copy } from 'lucide-react';
import { GeneratedImage, Character } from '@/types';
import { toast } from 'sonner';

interface ImageHistoryProps {
  images: GeneratedImage[];
  characters: Character[];
}

export const ImageHistory: React.FC<ImageHistoryProps> = ({
  images,
  characters
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [characterFilter, setCharacterFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'character'>('newest');

  const filteredImages = useMemo(() => {
    let filtered = images.filter(image => {
      const matchesSearch = !searchTerm || 
        image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.characterName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'favorites' && favorites.has(image.id)) ||
        image.status === statusFilter;
      
      const matchesCharacter = characterFilter === 'all' || 
        image.characterId === characterFilter;

      return matchesSearch && matchesStatus && matchesCharacter;
    });

    // Sort images
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'character':
          return (a.characterName || '').localeCompare(b.characterName || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, searchTerm, statusFilter, characterFilter, favorites, sortBy]);

  const toggleFavorite = (imageId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
        toast.success('Removed from favorites');
      } else {
        newFavorites.add(imageId);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'generating': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'canceled': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const stats = useMemo(() => {
    const total = images.length;
    const completed = images.filter(img => img.status === 'completed').length;
    const failed = images.filter(img => img.status === 'failed').length;
    const generating = images.filter(img => img.status === 'generating').length;
    
    return { total, completed, failed, generating };
  }, [images]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Image History
        </h2>
        <p className="text-muted-foreground">Browse and manage your generated images</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Images</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.generating}</div>
            <div className="text-sm text-muted-foreground">Generating</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <History className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-foreground">Image History</CardTitle>
              <CardDescription>Filter and browse your generated images</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={characterFilter} onValueChange={setCharacterFilter}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Filter by character" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Characters</SelectItem>
                <SelectItem value="">No Character</SelectItem>
                {characters.map(character => (
                  <SelectItem key={character.id} value={character.id}>
                    {character.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="character">By Character</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <Card key={image.id} className="bg-background border-border overflow-hidden">
                <div className="relative">
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <div className="text-center space-y-2">
                        {image.status === 'generating' && (
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {image.status === 'generating' ? 'Generating...' : 
                           image.status === 'failed' ? 'Generation Failed' : 'No Image'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge className={getStatusColor(image.status)}>
                      {image.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(image.id)}
                      className={`h-6 w-6 p-0 ${
                        favorites.has(image.id) 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${favorites.has(image.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {image.prompt}
                      </p>
                      {image.characterName && (
                        <p className="text-xs text-primary mt-1">
                          Character: {image.characterName}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                      {image.seed && <span>Seed: {image.seed}</span>}
                      {image.aspectRatio && <span>{image.aspectRatio}</span>}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPrompt(image.prompt)}
                        className="flex-1 h-8"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      {image.imageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadImage(image.imageUrl, image.prompt)}
                          className="flex-1 h-8"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No images found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || characterFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start generating some images to see them here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};