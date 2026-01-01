-- Add page format preservation fields to saved_pages table
ALTER TABLE public.saved_pages 
ADD COLUMN original_width integer,
ADD COLUMN original_height integer,
ADD COLUMN aspect_ratio text,
ADD COLUMN page_type text DEFAULT 'single',
ADD COLUMN layout_metadata jsonb DEFAULT '{}'::jsonb;

-- Add index for better performance
CREATE INDEX idx_saved_pages_page_type ON public.saved_pages(page_type);
CREATE INDEX idx_saved_pages_aspect_ratio ON public.saved_pages(aspect_ratio);