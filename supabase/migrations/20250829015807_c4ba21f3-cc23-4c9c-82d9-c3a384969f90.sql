-- Create saved_pages table
CREATE TABLE public.saved_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  page_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storybooks table
CREATE TABLE public.storybooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storybook_pages table (junction table)
CREATE TABLE public.storybook_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storybook_id UUID NOT NULL,
  saved_page_id UUID NOT NULL,
  page_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storybook_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_pages
CREATE POLICY "Users can view their own saved pages" 
ON public.saved_pages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved pages" 
ON public.saved_pages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved pages" 
ON public.saved_pages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved pages" 
ON public.saved_pages 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for storybooks
CREATE POLICY "Users can view their own storybooks" 
ON public.storybooks 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own storybooks" 
ON public.storybooks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storybooks" 
ON public.storybooks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storybooks" 
ON public.storybooks 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for storybook_pages
CREATE POLICY "Users can view storybook pages they own or are public" 
ON public.storybook_pages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.storybooks 
    WHERE storybooks.id = storybook_pages.storybook_id 
    AND (storybooks.user_id = auth.uid() OR storybooks.is_public = true)
  )
);

CREATE POLICY "Users can manage their own storybook pages" 
ON public.storybook_pages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.storybooks 
    WHERE storybooks.id = storybook_pages.storybook_id 
    AND storybooks.user_id = auth.uid()
  )
);

-- Add foreign key constraints
ALTER TABLE public.storybook_pages 
ADD CONSTRAINT fk_storybook_pages_storybook_id 
FOREIGN KEY (storybook_id) REFERENCES public.storybooks(id) ON DELETE CASCADE;

ALTER TABLE public.storybook_pages 
ADD CONSTRAINT fk_storybook_pages_saved_page_id 
FOREIGN KEY (saved_page_id) REFERENCES public.saved_pages(id) ON DELETE CASCADE;

-- Create storage bucket for page images
INSERT INTO storage.buckets (id, name, public) VALUES ('page-images', 'page-images', true);

-- Create storage policies for page images
CREATE POLICY "Page images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'page-images');

CREATE POLICY "Users can upload their own page images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own page images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own page images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_saved_pages_updated_at
BEFORE UPDATE ON public.saved_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_storybooks_updated_at
BEFORE UPDATE ON public.storybooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_saved_pages_user_id ON public.saved_pages(user_id);
CREATE INDEX idx_saved_pages_created_at ON public.saved_pages(created_at DESC);
CREATE INDEX idx_storybooks_user_id ON public.storybooks(user_id);
CREATE INDEX idx_storybooks_is_public ON public.storybooks(is_public);
CREATE INDEX idx_storybook_pages_storybook_id ON public.storybook_pages(storybook_id);
CREATE INDEX idx_storybook_pages_order ON public.storybook_pages(storybook_id, page_order);