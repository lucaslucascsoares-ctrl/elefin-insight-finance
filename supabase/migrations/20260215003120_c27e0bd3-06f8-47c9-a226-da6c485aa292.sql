
-- Categories table (shared/public read)
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('essenciais', 'desejos', 'prioridades'))
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are readable by everyone"
ON public.categories FOR SELECT
USING (true);

-- Seed default categories
INSERT INTO public.categories (name, group_type) VALUES
  ('Moradia', 'essenciais'),
  ('Alimentação', 'essenciais'),
  ('Transporte', 'essenciais'),
  ('Saúde', 'essenciais'),
  ('Educação', 'essenciais'),
  ('Contas Básicas', 'essenciais'),
  ('Delivery', 'desejos'),
  ('Lazer', 'desejos'),
  ('Compras', 'desejos'),
  ('Assinaturas', 'desejos'),
  ('Uber/Taxi', 'desejos'),
  ('Restaurantes', 'desejos'),
  ('Investimentos', 'prioridades'),
  ('Reserva de Emergência', 'prioridades'),
  ('Dívidas', 'prioridades'),
  ('Previdência', 'prioridades');

-- Transactions table (user-specific)
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id);
