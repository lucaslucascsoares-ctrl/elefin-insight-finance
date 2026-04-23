import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { MonthlyProjectionOverride, MonthlyProjectionStatus, ProjectionTemplate } from '@/types/finance';
import { buildMonthlyProjectionItems } from '@/lib/projections';

interface SaveProjectionOverrideInput {
  templateId: string;
  month: number;
  year: number;
  amountOverride: number | null;
  titleOverride: string | null;
  status: MonthlyProjectionStatus;
  paidTransactionId: string | null;
}

export function useMonthlyProjectionItems(
  userId: string | undefined,
  templates: ProjectionTemplate[],
  month: number,
  year: number,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const queryKey = ['monthly_projection_overrides', userId, month, year];

  const { data: overrides = [], isLoading } = useQuery({
    queryKey,
    enabled: Boolean(userId && isSupabaseConfigured && (options?.enabled ?? true)),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_projection_overrides')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year);

      if (error) throw error;
      return data as MonthlyProjectionOverride[];
    },
  });

  const saveOverrideMutation = useMutation({
    mutationFn: async ({
      templateId,
      month: overrideMonth,
      year: overrideYear,
      amountOverride,
      titleOverride,
      status,
      paidTransactionId,
    }: SaveProjectionOverrideInput) => {
      if (!userId) return null;

      const existingOverride =
        overrideMonth === month && overrideYear === year
          ? overrides.find((override) => override.template_id === templateId)
          : null;

      const payload = {
        user_id: userId,
        template_id: templateId,
        month: overrideMonth,
        year: overrideYear,
        amount_override:
          amountOverride === undefined ? existingOverride?.amount_override ?? null : amountOverride,
        title_override:
          titleOverride === undefined ? existingOverride?.title_override ?? null : titleOverride,
        status: status ?? existingOverride?.status ?? 'predicted',
        paid_transaction_id:
          paidTransactionId === undefined ? existingOverride?.paid_transaction_id ?? null : paidTransactionId,
      };

      const { data, error } = await supabase
        .from('monthly_projection_overrides')
        .upsert(payload, { onConflict: 'user_id,template_id,month,year' })
        .select()
        .single();

      if (error) throw error;
      return data as MonthlyProjectionOverride;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const clearOverrideMutation = useMutation({
    mutationFn: async ({
      templateId,
      overrideMonth,
      overrideYear,
    }: {
      templateId: string;
      overrideMonth: number;
      overrideYear: number;
    }) => {
      if (!userId) return;

      const { error } = await supabase
        .from('monthly_projection_overrides')
        .delete()
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .eq('month', overrideMonth)
        .eq('year', overrideYear);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const items = useMemo(
    () => buildMonthlyProjectionItems({ templates, overrides, month, year }),
    [month, overrides, templates, year],
  );

  return {
    items,
    overrides,
    isLoading,
    saveOverride: (input: SaveProjectionOverrideInput) => saveOverrideMutation.mutateAsync(input),
    clearOverride: (templateId: string, overrideMonth: number, overrideYear: number) =>
      clearOverrideMutation.mutateAsync({ templateId, overrideMonth, overrideYear }),
  };
}
