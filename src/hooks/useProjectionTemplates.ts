import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { ProjectionTemplate, ProjectionTemplateInput } from '@/types/finance';

const normalizeTemplate = (template: ProjectionTemplate & { subcategory_name?: string | null }) => ({
  ...template,
  account_name: template.account_name ?? template.title,
  category_name: template.category_name ?? template.subcategory_name ?? 'Sem categoria',
  legacy_local_id: template.legacy_local_id ?? null,
  source: 'projecao' as const,
});

export function useProjectionTemplates(userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['projection_templates', userId];

  const { data: templates = [], isLoading } = useQuery({
    queryKey,
    enabled: Boolean(userId && isSupabaseConfigured),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projection_templates')
        .select('*')
        .eq('user_id', userId)
        .order('group_type')
        .order('account_name');

      if (error) throw error;
      return (data as ProjectionTemplate[]).map(normalizeTemplate);
    },
  });

  const addTemplateMutation = useMutation({
    mutationFn: async (input: ProjectionTemplateInput) => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('projection_templates')
        .insert({
          user_id: userId,
          title: input.title.trim(),
          account_name: input.account_name.trim(),
          category_name: input.category_name.trim(),
          description: input.description?.trim() || null,
          default_amount: input.default_amount,
          category_id: input.category_id,
          group_type: input.group_type,
          source: 'projecao',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return normalizeTemplate(data as ProjectionTemplate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ templateId, input }: { templateId: string; input: ProjectionTemplateInput }) => {
      const { data, error } = await supabase
        .from('projection_templates')
        .update({
          title: input.title.trim(),
          account_name: input.account_name.trim(),
          category_name: input.category_name.trim(),
          description: input.description?.trim() || null,
          default_amount: input.default_amount,
          category_id: input.category_id,
          group_type: input.group_type,
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      return normalizeTemplate(data as ProjectionTemplate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase.from('projection_templates').delete().eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleTemplateActiveMutation = useMutation({
    mutationFn: async ({ templateId, active }: { templateId: string; active: boolean }) => {
      const { error } = await supabase
        .from('projection_templates')
        .update({ is_active: active })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const activeTemplates = useMemo(() => templates.filter((template) => template.is_active), [templates]);

  return {
    templates,
    activeTemplates,
    isLoading,
    addTemplate: (input: ProjectionTemplateInput) => addTemplateMutation.mutateAsync(input),
    updateTemplate: (templateId: string, input: ProjectionTemplateInput) =>
      updateTemplateMutation.mutateAsync({ templateId, input }),
    deleteTemplate: (templateId: string) => deleteTemplateMutation.mutateAsync(templateId),
    toggleTemplateActive: (templateId: string, active: boolean) =>
      toggleTemplateActiveMutation.mutateAsync({ templateId, active }),
  };
}
