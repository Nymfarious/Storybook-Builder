import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Maximize2, Minimize2 } from 'lucide-react';
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
  original_width?: number;
  original_height?: number;
  aspect_ratio?: string;
  page_type?: string;
  layout_metadata?: any;
}

interface Storybook {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  pages?: SavedPage[];
}

export default function Storybook() {
  const { id: storybookId } = useParams();
  const { user } = useAuth();
  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageFlipping, setPageFlipping] = useState(false);

  useEffect(() => {
    if (storybookId && user) {
      loadStorybook();
    }
  }, [storybookId, user]);

  const loadStorybook = async () => {
    try {
      setIsLoading(true);
      
      // First get the storybook
      const { data: storybookData, error: storybookError } = await supabase
        .from('storybooks')
        .select('*')
        .eq('id', storybookId)
        .single();

      if (storybookError) throw storybookError;

      // Then get the pages for this storybook
      const { data: pagesData, error: pagesError } = await supabase
        .from('storybook_pages')
        .select(`
          page_order,
          saved_pages (*)
        `)
        .eq('storybook_id', storybookId)
        .order('page_order');

      if (pagesError) throw pagesError;

      const pages = pagesData?.map(item => item.saved_pages).filter(Boolean) as SavedPage[] || [];

      setStorybook({
        ...storybookData,
        pages
      });

    } catch (error) {
      console.error('Error loading storybook:', error);
      toast.error('Failed to load storybook');
    } finally {
      setIsLoading(false);
    }
  };

  const nextPage = () => {
    if (storybook?.pages && currentPageIndex < storybook.pages.length - 1) {
      setPageFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(currentPageIndex + 1);
        setPageFlipping(false);
      }, 300);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setPageFlipping(true);
      setTimeout(() => {
        setCurrentPageIndex(currentPageIndex - 1);
        setPageFlipping(false);
      }, 300);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading storybook...</p>
        </div>
      </div>
    );
  }

  if (!storybook || !storybook.pages?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Storybook Not Found</h2>
          <p className="text-muted-foreground mb-4">This storybook doesn't exist or has no pages.</p>
          <Link to="/saved-pages">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPage = storybook.pages[currentPageIndex];

  return (
    <div className={`bg-gradient-to-br from-background via-background to-muted transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'
    }`}>
      {/* Header */}
      {!isFullscreen && (
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/saved-pages">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Gallery
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{storybook.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Page {currentPageIndex + 1} of {storybook.pages.length}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </header>
      )}

      {/* Storybook Reader */}
      <div className="flex items-center justify-center p-4" style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 80px)' }}>
        <div className="relative max-w-4xl w-full">
          {/* Page Container with format preservation */}
          <div className="relative mx-auto" style={{ perspective: '1200px' }}>
            <Card 
              className={`
                relative mx-auto overflow-hidden
                shadow-2xl transition-transform duration-300
                ${pageFlipping ? 'animate-scale-out' : 'animate-scale-in'}
              `}
              style={{
                // Preserve original page aspect ratio if available
                aspectRatio: currentPage.aspect_ratio || '3/4',
                maxHeight: '85vh',
                maxWidth: '90vw'
              }}
            >
              {/* Page Image */}
              <div className="relative w-full h-full">
                <img
                  src={currentPage.image_url}
                  alt={currentPage.title}
                  className="w-full h-full"
                  style={{
                    // Preserve original format without distortion
                    objectFit: currentPage.original_width && currentPage.original_height ? 'contain' : 'cover',
                    backgroundColor: '#ffffff'
                  }}
                />
                
                {/* Page Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <h2 className="text-white text-lg font-semibold mb-1">
                    {currentPage.title}
                  </h2>
                  {currentPage.description && (
                    <p className="text-white/80 text-sm">
                      {currentPage.description}
                    </p>
                  )}
                </div>

                {/* Page curl effect on hover */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-0 hover:opacity-20 transition-opacity bg-gradient-to-br from-white/50 to-transparent transform rotate-45 translate-x-8 -translate-y-8 pointer-events-none" />
              </div>
            </Card>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
              onClick={prevPage}
              disabled={currentPageIndex === 0 || pageFlipping}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
              onClick={nextPage}
              disabled={currentPageIndex === storybook.pages.length - 1 || pageFlipping}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Page Counter */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              {storybook.pages.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentPageIndex
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  onClick={() => {
                    if (index !== currentPageIndex) {
                      setPageFlipping(true);
                      setTimeout(() => {
                        setCurrentPageIndex(index);
                        setPageFlipping(false);
                      }, 300);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Fullscreen controls */}
          {isFullscreen && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
              onClick={toggleFullscreen}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard navigation hint */}
      {!isFullscreen && (
        <div className="text-center pb-6">
          <p className="text-sm text-muted-foreground">
            Use arrow keys or click the navigation buttons to turn pages
          </p>
        </div>
      )}
    </div>
  );
}