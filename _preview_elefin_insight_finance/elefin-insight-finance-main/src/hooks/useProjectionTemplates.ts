import { useEffect, useMemo, useState } from 'react';
import { ProjectionTemplate, ProjectionTemplateInput } from '@/types/finance';
import { getProjectionTemplatesStorageKey, readLocalStorageJson, writeLocalStorageJson } from '@/lib/projections';

const createTemplateId = () => `projection-template-${Math.random().toString(36).slice(2, 10)}`;

const normalizeTemplate = (template: ProjectionTemplate & { subcategory_name?: string | null }) => ({
  ...template,
  account_name: template.account_name ?? template.title,
  category_name: template.category_name ?? template.subcategory_name ?? 'Sem categoria',
  source: 'projecao' as const,
});

export function useProjectionTemplates(userId?: string) {
  const [templates, setTemplates] = useState<ProjectionTemplate[]>([]);

  useEffect(() => {
    if (!userId) {
      setTemplates([]);
      return;
    }

    const storageKey = getProjectionTemplatesStorageKey(userId);
    const storedTemplates = readLocalStorageJson<(ProjectionTemplate & { subcategory_name?: string | null })[]>(
      storageKey,
      [],
    ).map(normalizeTemplate);
    writeLocalStorageJson(storageKey, storedTemplates);
    setTemplates(storedTemplates);
  }, [userId]);

  const persistTemplates = (nextTemplates: ProjectionTemplate[]) => {
    if (!userId) return;
    writeLocalStorageJson(getProjectionTemplatesStorageKey(userId), nextTemplates);
    setTemplates(nextTemplates);
  };

  const addTemplate = (input: ProjectionTemplateInput) => {
    if (!userId) return null;

    const now = new Date().toISOString();
    const nextTemplate: ProjectionTemplate = {
      id: createTemplateId(),
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
      created_at: now,
      updated_at: now,
    };

    persistTemplates([...templates, nextTemplate]);
    return nextTemplate;
  };

  const updateTemplate = (templateId: string, input: ProjectionTemplateInput) => {
    const nextTemplates = templates.map((template) =>
      template.id === templateId
        ? {
            ...template,
            title: input.title.trim(),
            account_name: input.account_name.trim(),
            category_name: input.category_name.trim(),
            description: input.description?.trim() || null,
            default_amount: input.default_amount,
            category_id: input.category_id,
            group_type: input.group_type,
            updated_at: new Date().toISOString(),
          }
        : template,
    );

    persistTemplates(nextTemplates);
  };

  const deleteTemplate = (templateId: string) => {
    persistTemplates(templates.filter((template) => template.id !== templateId));
  };

  const toggleTemplateActive = (templateId: string, active: boolean) => {
    const nextTemplates = templates.map((template) =>
      template.id === templateId ? { ...template, is_active: active, updated_at: new Date().toISOString() } : template,
    );

    persistTemplates(nextTemplates);
  };

  const activeTemplates = useMemo(
    () => templates.filter((template) => template.is_active),
    [templates],
  );

  return {
    templates,
    activeTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateActive,
  };
}
