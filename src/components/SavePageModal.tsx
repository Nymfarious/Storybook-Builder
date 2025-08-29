import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Download, BookOpen, Plus } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SavePageModalProps {
  pageElement: HTMLElement | null;
  pageData: any;
  onSave: (pageInfo: { title: string; description: string; imageUrl: string; pageData: any; id?: string }) => void;
}

interface Storybook {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
}

export const SavePageModal: React.FC<SavePageModalProps> = ({
  pageElement,
  pageData,
  onSave
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [addToStorybook, setAddToStorybook] = useState(false);
  const [selectedStorybook, setSelectedStorybook] = useState<string>('');
  const [newStorybookTitle, setNewStorybookTitle] = useState('');
  const [createNewStorybook, setCreateNewStorybook] = useState(false);
  const [storybooks, setStorybooks] = useState<Storybook[]>([]);
  const { user } = useAuth();

  // Load existing storybooks
  useEffect(() => {
    if (user && isOpen) {
      loadStorybooks();
    }
  }, [user, isOpen]);

  const loadStorybooks = async () => {
    try {
      const { data, error } = await supabase
        .from('storybooks')
        .select('id, title, description, cover_image_url')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStorybooks(data || []);
    } catch (error) {
      console.error('Error loading storybooks:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the page');
      return;
    }

    if (addToStorybook && createNewStorybook && !newStorybookTitle.trim()) {
      toast.error('Please enter a title for the new storybook');
      return;
    }

    if (addToStorybook && !createNewStorybook && !selectedStorybook) {
      toast.error('Please select a storybook');
      return;
    }

    if (!pageElement) {
      toast.error('Page element not found');
      return;
    }

    if (!user) {
      toast.error('Please sign in to save pages');
      return;
    }

    setIsCapturing(true);

    try {
      // Get original dimensions for format preservation
      const rect = pageElement.getBoundingClientRect();
      const originalWidth = Math.round(rect.width);
      const originalHeight = Math.round(rect.height);
      const aspectRatio = `${originalWidth}:${originalHeight}`;

      // Enhanced capture settings for better format preservation
      const canvas = await html2canvas(pageElement, {
        scale: 3, // Higher quality for better preservation
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: originalWidth,
        height: originalHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: originalWidth,
        windowHeight: originalHeight,
        ignoreElements: (element) => {
          // Ignore overlay elements that might interfere
          return element.classList.contains('absolute') && 
                 (element.classList.contains('top-') || element.classList.contains('right-'));
        }
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 1.0); // Maximum quality
      });

      if (!blob) throw new Error('Failed to create image blob');

      // Upload image to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      // Save page data with enhanced metadata
      const { data: savedPage, error: saveError } = await supabase
        .from('saved_pages')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          image_url: publicUrl,
          page_data: pageData,
          original_width: originalWidth,
          original_height: originalHeight,
          aspect_ratio: aspectRatio,
          page_type: 'graphic_novel',
          layout_metadata: {
            captureScale: 3,
            preserveFormat: true,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
          }
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Handle storybook integration
      if (addToStorybook) {
        let storybookId = selectedStorybook;

        // Create new storybook if needed
        if (createNewStorybook) {
          const { data: newStorybook, error: storybookError } = await supabase
            .from('storybooks')
            .insert({
              user_id: user.id,
              title: newStorybookTitle.trim(),
              description: `Created with page: ${title.trim()}`,
              cover_image_url: publicUrl
            })
            .select()
            .single();

          if (storybookError) throw storybookError;
          storybookId = newStorybook.id;
        }

        // Add page to storybook
        if (storybookId) {
          // Get current page count for ordering
          const { count } = await supabase
            .from('storybook_pages')
            .select('*', { count: 'exact', head: true })
            .eq('storybook_id', storybookId);

          const { error: pageError } = await supabase
            .from('storybook_pages')
            .insert({
              storybook_id: storybookId,
              saved_page_id: savedPage.id,
              page_order: (count || 0) + 1
            });

          if (pageError) throw pageError;

          // Update cover image if it's the first page
          if (!count || count === 0) {
            await supabase
              .from('storybooks')
              .update({ cover_image_url: publicUrl })
              .eq('id', storybookId);
          }
        }
      }

      // Call the onSave callback
      onSave({
        title: title.trim(),
        description: description.trim(),
        imageUrl: publicUrl,
        pageData,
        id: savedPage.id
      });

      toast.success(addToStorybook ? 'Page saved and added to storybook!' : 'Page saved to cloud successfully!');
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setAddToStorybook(false);
      setSelectedStorybook('');
      setNewStorybookTitle('');
      setCreateNewStorybook(false);
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page to cloud');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          Save Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Save Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title..."
              disabled={isCapturing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this page..."
              rows={3}
              disabled={isCapturing}
            />
          </div>

          {/* Storybook Integration */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="addToStorybook" 
                checked={addToStorybook}
                onCheckedChange={(checked) => setAddToStorybook(!!checked)}
                disabled={isCapturing}
              />
              <Label htmlFor="addToStorybook" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Add to Storybook
              </Label>
            </div>

            {addToStorybook && (
              <div className="space-y-3 ml-6 border-l-2 border-muted pl-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="createNew" 
                    checked={createNewStorybook}
                    onCheckedChange={(checked) => setCreateNewStorybook(!!checked)}
                    disabled={isCapturing}
                  />
                  <Label htmlFor="createNew" className="flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    Create New Storybook
                  </Label>
                </div>

                {createNewStorybook ? (
                  <div className="space-y-2">
                    <Label htmlFor="newStorybook">New Storybook Title *</Label>
                    <Input
                      id="newStorybook"
                      value={newStorybookTitle}
                      onChange={(e) => setNewStorybookTitle(e.target.value)}
                      placeholder="Enter storybook title..."
                      disabled={isCapturing}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="existingStorybook">Select Storybook *</Label>
                    <Select
                      value={selectedStorybook}
                      onValueChange={setSelectedStorybook}
                      disabled={isCapturing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a storybook..." />
                      </SelectTrigger>
                      <SelectContent>
                        {storybooks.map((storybook) => (
                          <SelectItem key={storybook.id} value={storybook.id}>
                            {storybook.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {storybooks.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No storybooks found. Create a new one instead.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCapturing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isCapturing || !title.trim() || (addToStorybook && createNewStorybook && !newStorybookTitle.trim()) || (addToStorybook && !createNewStorybook && !selectedStorybook)}
            >
              {isCapturing ? 'Saving...' : addToStorybook ? 'Save & Add to Storybook' : 'Save Page'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};