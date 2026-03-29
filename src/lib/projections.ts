import { MonthlyProjectionItem, MonthlyProjectionOverride, ProjectionTemplate } from '@/types/finance';

export const createMonthlyProjectionOverrideId = (templateId: string, month: number, year: number) =>
  `${templateId}:${year}-${month}`;

export const getProjectionMonthKey = (month: number, year: number) => `${year}-${month}`;

export const buildMonthlyProjectionItems = ({
  templates,
  overrides,
  month,
  year,
}: {
  templates: ProjectionTemplate[];
  overrides: MonthlyProjectionOverride[];
  month: number;
  year: number;
}): MonthlyProjectionItem[] => {
  const relevantOverrides = new Map(
    overrides
      .filter((override) => override.month === month && override.year === year)
      .map((override) => [override.template_id, override]),
  );

  return templates
    .filter((template) => template.is_active)
    .map((template) => {
      const override = relevantOverrides.get(template.id);
      const amount = override?.amount_override ?? template.default_amount;
      const title = override?.title_override?.trim() || template.title;

      return {
        id: override?.id ?? createMonthlyProjectionOverrideId(template.id, month, year),
        template_id: template.id,
        user_id: template.user_id,
        month,
        year,
        title,
        account_name: template.account_name,
        category_name: template.category_name,
        amount,
        category_id: template.category_id,
        group_type: template.group_type,
        status: override?.status ?? 'predicted',
        paid_transaction_id: override?.paid_transaction_id ?? null,
        is_overridden: Boolean(
          override &&
            (override.amount_override !== null ||
              Boolean(override.title_override && override.title_override.trim().length > 0)),
        ),
        due_day: template.due_day,
        reminder_enabled: template.reminder_enabled,
        reminder_days_before: template.reminder_days_before,
        reminder_on_due_date: template.reminder_on_due_date,
      };
    })
    .sort((first, second) => {
      if (first.group_type !== second.group_type) {
        return first.group_type.localeCompare(second.group_type);
      }

      return first.title.localeCompare(second.title, 'pt-BR');
    });
};
