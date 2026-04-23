import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { RecurringRule, RecurringRuleInput } from '@/types/finance';

const normalize = (value: string | null | undefined) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function useRecurringRules(userId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['recurring_rules', userId];

  const { data: rules = [], isLoading } = useQuery({
    queryKey,
    enabled: Boolean(userId && isSupabaseConfigured),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as RecurringRule[];
    },
  });

  const activeRules = useMemo(() => rules.filter((rule) => rule.active), [rules]);

  const saveRuleMutation = useMutation({
    mutationFn: async (input: RecurringRuleInput) => {
      if (!userId) return null;

      const normalizedDescription = normalize(input.description);
      const startsAt = input.starts_at.slice(0, 10);

      const existing = rules.find(
        (rule) =>
          rule.type === input.type &&
          rule.category_id === input.category_id &&
          normalize(rule.description) === normalizedDescription,
      );

      if (existing) {
        const { data, error } = await supabase
          .from('recurring_rules')
          .update({
            amount: input.amount,
            starts_at: startsAt,
            description: input.description,
            active: true,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as RecurringRule;
      }

      const { data, error } = await supabase
        .from('recurring_rules')
        .insert({
          user_id: userId,
          type: input.type,
          amount: input.amount,
          category_id: input.category_id,
          description: input.description,
          starts_at: startsAt,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as RecurringRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const removeRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase.from('recurring_rules').delete().eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, active }: { ruleId: string; active: boolean }) => {
      const { error } = await supabase.from('recurring_rules').update({ active }).eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    rules,
    activeRules,
    isLoading,
    saveRule: (input: RecurringRuleInput) => saveRuleMutation.mutateAsync(input),
    removeRule: (ruleId: string) => removeRuleMutation.mutateAsync(ruleId),
    toggleRule: (ruleId: string, active: boolean) => toggleRuleMutation.mutateAsync({ ruleId, active }),
  };
}
