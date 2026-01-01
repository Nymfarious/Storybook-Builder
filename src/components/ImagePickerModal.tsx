import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Image, Users, Check, X } from 'lucide-react';
import { GeneratedImage, Character } from '@/types';
import { toast } from 'sonner';

interface ImagePickerModalProps {
  images: GeneratedImage[];
  characters: Character[];
  onImageSelect: (imageUrl: string) => void;
  trigger: React.ReactNode;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  images,
  characters,
  onImageSelect,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('all');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const completedImages = useMemo(() => {
    return images.filter(img => img.status === 'completed' && img.imageUrl);
  }, [images]);

  const filteredImages = useMemo(() => {
    return completedImages.filter(image => {
      const matchesCharacter = selectedCharacter === 'all' || 
        (selectedCharacter === 'none' ? !image.characterId : image.characterId === selectedCharacter);
      const matchesSearch = searchTerm === '' || 
        image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (image.characterName && image.characterName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCharacter && matchesSearch;
    });
  }, [completedImages, selectedCharacter, searchTerm]);

  const characterReferenceImages = useMemo(() => {
    return characters.flatMap(char => 
      char.referenceImages.map(url => ({
        id: `char-${char.id}-${url}`,
        url,
        characterName: char.name,
        characterId: char.id,
        prompt: `Reference image for ${char.name}`,
        isCharacterRef: true
      }))
    );
  }, [characters]);

  const filteredCharacterImages = useMemo(() => {
    if (selectedCharacter === 'all') return characterReferenceImages;
    if (selectedCharacter === 'none') return [];
    return characterReferenceImages.filter(img => img.characterId === selectedCharacter);
  }, [characterReferenceImages, selectedCharacter]);

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    setOpen(false);
    toast.success('Image selected successfully!');
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleBatchSelect = () => {
    if (selectedImages.length === 0) return;
    
    // For now, just select the first image. Later we can implement composite image creation
    onImageSelect(selectedImages[0]);
    setSelectedImages([]);
    setOpen(false);
    toast.success(`Selected ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}!`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Choose Image from Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by prompt or character..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            
            <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Characters</SelectItem>
                <SelectItem value="none">No Character</SelectItem>
                {characters.map(character => (
                  <SelectItem key={character.id} value={character.id}>
                    {character.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Batch Selection Controls */}
          {selectedImages.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImages([])}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={handleBatchSelect}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Use Selected
                </Button>
              </div>
            </div>
          )}

          <Tabs defaultValue="generated" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="generated" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Generated Images ({filteredImages.length})
              </TabsTrigger>
              <TabsTrigger value="characters" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Character References ({filteredCharacterImages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generated" className="mt-4">
              <ScrollArea className="h-96">
                {filteredImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                    {filteredImages.map(image => (
                      <Card 
                        key={image.id} 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-elegant ${
                          selectedImages.includes(image.imageUrl) 
                            ? 'ring-2 ring-primary shadow-glow' 
                            : 'bg-gradient-card border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleImageSelection(image.imageUrl)}
                      >
                        <CardContent className="p-2">
                          <div className="aspect-square relative mb-2">
                            <img
                              src={image.imageUrl}
                              alt={image.prompt}
                              className="w-full h-full object-cover rounded"
                            />
                            {selectedImages.includes(image.imageUrl) && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded">
                                <Check className="h-6 w-6 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-foreground line-clamp-2 font-medium">
                              {image.prompt}
                            </p>
                            {image.characterName && (
                              <Badge variant="outline" className="text-xs">
                                {image.characterName}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No images found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="characters" className="mt-4">
              <ScrollArea className="h-96">
                {filteredCharacterImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                    {filteredCharacterImages.map(image => (
                      <Card 
                        key={image.id} 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-elegant ${
                          selectedImages.includes(image.url) 
                            ? 'ring-2 ring-primary shadow-glow' 
                            : 'bg-gradient-card border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleImageSelection(image.url)}
                      >
                        <CardContent className="p-2">
                          <div className="aspect-square relative mb-2">
                            <img
                              src={image.url}
                              alt={image.prompt}
                              className="w-full h-full object-cover rounded"
                            />
                            {selectedImages.includes(image.url) && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded">
                                <Check className="h-6 w-6 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {image.characterName}
                            </Badge>
                            <p className="text-xs text-muted-foreground">Reference Image</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No character references found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};