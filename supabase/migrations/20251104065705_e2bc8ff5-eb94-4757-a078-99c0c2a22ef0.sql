-- Add linkedin_url field to articles table
ALTER TABLE public.articles
ADD COLUMN linkedin_url TEXT;

-- Add linkedin_url field to news table
ALTER TABLE public.news
ADD COLUMN linkedin_url TEXT;