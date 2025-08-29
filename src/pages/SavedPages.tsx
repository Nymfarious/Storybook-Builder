import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, Plus, Trash2, Eye, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SavedPage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  page_data: any;
  created_at: string;
}

interface Storybook {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
}

export default function SavedPages() {
  const { user } = useAuth();
  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);
  const [storybooks, setStorybooks] = useState<Storybook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateStorybookOpen, setIsCreateStorybookOpen] = useState(false);
  const [storybookTitle, setStorybookTitle] = useState('');
  const [storybookDescription, setStorybookDescription] = useState('');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load saved pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('saved_pages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (pagesError) throw pagesError;

      // Load storybooks
      const { data: storybooksData, error: storybooksError } = await supabase
        .from('storybooks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (storybooksError) throw storybooksError;

      setSavedPages(pagesData || []);
      setStorybooks(storybooksData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load saved pages');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('saved_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      setSavedPages(prev => prev.filter(p => p.id !== pageId));
      toast.success('Page deleted successfully');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const createStorybook = async () => {
    if (!storybookTitle.trim()) {
      toast.error('Please enter a title for the storybook');
      return;
    }

    if (selectedPages.size === 0) {
      toast.error('Please select at least one page');
      return;
    }

    try {
      // Create the storybook
      const { data: storybook, error: storybookError } = await supabase
        .from('storybooks')
        .insert({
          user_id: user?.id,
          title: storybookTitle.trim(),
          description: storybookDescription.trim(),
          cover_image_url: savedPages.find(p => selectedPages.has(p.id))?.image_url
        })
        .select()
        .single();

      if (storybookError) throw storybookError;

      // Add pages to the storybook
      const storybookPages = Array.from(selectedPages).map((pageId, index) => ({
        storybook_id: storybook.id,
        saved_page_id: pageId,
        page_order: index + 1
      }));

      const { error: pagesError } = await supabase
        .from('storybook_pages')
        .insert(storybookPages);

      if (pagesError) throw pagesError;

      // Reset form and reload data
      setStorybookTitle('');
      setStorybookDescription('');
      setSelectedPages(new Set());
      setIsCreateStorybookOpen(false);
      
      await loadData();
      toast.success('Storybook created successfully!');

    } catch (error) {
      console.error('Error creating storybook:', error);
      toast.error('Failed to create storybook');
    }
  };

  const togglePageSelection = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Image className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading your saved pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studio
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Saved Pages Gallery</h1>
              <p className="text-sm text-muted-foreground">
                {savedPages.length} pages • {storybooks.length} storybooks
              </p>
            </div>
          </div>
          <Dialog open={isCreateStorybookOpen} onOpenChange={setIsCreateStorybookOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Storybook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Storybook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storybook-title">Title *</Label>
                  <Input
                    id="storybook-title"
                    value={storybookTitle}
                    onChange={(e) => setStorybookTitle(e.target.value)}
                    placeholder="Enter storybook title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storybook-description">Description (Optional)</Label>
                  <Textarea
                    id="storybook-description"
                    value={storybookDescription}
                    onChange={(e) => setStorybookDescription(e.target.value)}
                    placeholder="Describe your storybook..."
                    rows={3}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Selected pages: {selectedPages.size}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateStorybookOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createStorybook}>
                    Create Storybook
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Storybooks Section */}
        {storybooks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              My Storybooks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storybooks.map((storybook) => (
                <Card key={storybook.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <Link to={`/storybook/${storybook.id}`}>
                    <CardContent className="p-0">
                      {storybook.cover_image_url && (
                        <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                          <img
                            src={storybook.cover_image_url}
                            alt={storybook.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{storybook.title}</h3>
                        {storybook.description && (
                          <p className="text-sm text-muted-foreground mb-2">{storybook.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(storybook.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Saved Pages Section */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Saved Pages
            {selectedPages.size > 0 && (
              <span className="text-sm text-muted-foreground">
                ({selectedPages.size} selected)
              </span>
            )}
          </h2>

          {savedPages.length === 0 ? (
            <Card className="p-12 text-center">
              <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Saved Pages</h3>
              <p className="text-muted-foreground mb-4">
                Start creating pages in the Graphic Novel Builder to see them here.
              </p>
              <Link to="/">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Builder
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedPages.map((page) => (
                <Card
                  key={page.id}
                  className={`group hover:shadow-lg transition-all cursor-pointer ${
                    selectedPages.has(page.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => togglePageSelection(page.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] overflow-hidden rounded-t-lg relative">
                      <img
                        src={page.image_url}
                        alt={page.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {selectedPages.has(page.id) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="w-8 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(page.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 truncate">{page.title}</h3>
                      {page.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{page.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Saved {new Date(page.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}