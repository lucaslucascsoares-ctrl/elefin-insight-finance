import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MonthBalance } from '@/types/finance';

/**
 * Busca o registro de caixa_inicial persistido para o mês/ano selecionado.
 * Retorna null se ainda não existir registro (primeiro acesso ao mês).
 */
export function useMonthBalance(userId: string | undefined, mes: number, ano: number) {
  return useQuery({
    queryKey: ['month_balance', userId, mes, ano],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('month_balances')
        .select('*')
        .eq('user_id', userId)
        .eq('mes', mes)
        .eq('ano', ano)
        .maybeSingle();

      if (error) {
        return null;
      }
      return (data as MonthBalance) ?? null;
    },
  });
}

/**
 * Garante que o registro de caixa_inicial do mês existe no banco.
 * Se já existir (uniqueness conflict), ignora — não sobrescreve.
 * Usar apenas para criar o registro pela primeira vez.
 */
export function useEnsureMonthBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user_id,
      mes,
      ano,
      caixa_inicial,
    }: {
      user_id: string;
      mes: number;
      ano: number;
      caixa_inicial: number;
    }) => {
      // ignoreDuplicates: true → INSERT ... ON CONFLICT DO NOTHING
      // Garante que o valor inicial não seja sobrescrito se já existir
      const { data, error } = await supabase
        .from('month_balances')
        .upsert(
          { user_id, mes, ano, caixa_inicial },
          { onConflict: 'user_id,mes,ano', ignoreDuplicates: true },
        )
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as MonthBalance | null;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['month_balance', variables.user_id, variables.mes, variables.ano],
      });
    },
  });
}
