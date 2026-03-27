
-- Add user_id to categories so users can create their own custom categories
ALTER TABLE public.categories ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT NULL;

-- Drop existing SELECT policy and recreate to include user-specific categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;

CREATE POLICY "Users can view global and own categories"
ON public.categories FOR SELECT
USING (user_id IS NULL OR user_id = auth.uid());

-- Allow authenticated users to insert their own categories
CREATE POLICY "Users can insert own categories"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own categories (not global ones)
CREATE POLICY "Users can delete own categories"
ON public.categories FOR DELETE
USING (auth.uid() = user_id);
