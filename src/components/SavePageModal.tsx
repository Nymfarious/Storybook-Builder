import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SavePageModalProps {
  pageElement: HTMLElement | null;
  pageData: any;
  onSave: (pageInfo: { title: string; description: string; imageUrl: string; pageData: any; id?: string }) => void;
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
  const { user } = useAuth();

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the page');
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
      // Capture the page as an image
      const canvas = await html2canvas(pageElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
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

      // Save page data to database
      const { data: savedPage, error: saveError } = await supabase
        .from('saved_pages')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          image_url: publicUrl,
          page_data: pageData
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Call the onSave callback with the saved page data
      onSave({
        title: title.trim(),
        description: description.trim(),
        imageUrl: publicUrl,
        pageData,
        id: savedPage.id
      });

      toast.success('Page saved to cloud successfully!');
      setIsOpen(false);
      setTitle('');
      setDescription('');
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Page to Gallery</DialogTitle>
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
              disabled={isCapturing || !title.trim()}
            >
              {isCapturing ? 'Saving...' : 'Save Page'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};