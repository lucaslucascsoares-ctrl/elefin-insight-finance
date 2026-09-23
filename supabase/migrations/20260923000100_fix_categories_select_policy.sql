-- A migração 20260215183335 tentou remover a policy pública de leitura com o
-- nome errado ("viewable" em vez de "readable"). Como policies permissivas são
-- combinadas com OR, a policy antiga (USING (true)) continuava expondo as
-- categorias personalizadas de todos os usuários.
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;

DROP POLICY IF EXISTS "Users can view global and own categories" ON public.categories;
CREATE POLICY "Users can view global and own categories"
ON public.categories FOR SELECT
USING (user_id IS NULL OR user_id = auth.uid());
