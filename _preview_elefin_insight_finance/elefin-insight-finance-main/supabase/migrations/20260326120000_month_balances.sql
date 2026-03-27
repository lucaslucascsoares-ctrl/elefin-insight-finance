-- month_balances: persiste o caixa_inicial de cada mês por usuário
-- caixa_inicial = saldo_final do mês anterior
-- saldo_final é sempre calculado: caixa_inicial + entradas - saidas
CREATE TABLE IF NOT EXISTS month_balances (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes          INTEGER       NOT NULL CHECK (mes >= 0 AND mes <= 11),
  ano          INTEGER       NOT NULL,
  caixa_inicial DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, mes, ano)
);

ALTER TABLE month_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own month balances"
  ON month_balances
  FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
