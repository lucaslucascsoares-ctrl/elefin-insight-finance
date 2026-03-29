import { describe, expect, it } from 'vitest';
import { buildMonthlyProjectionItems } from '@/lib/projections';
import { MonthlyProjectionOverride, ProjectionTemplate } from '@/types/finance';

const buildTemplate = (partial: Partial<ProjectionTemplate>): ProjectionTemplate => ({
  id: 'template-1',
  user_id: 'user-1',
  title: 'Internet',
  account_name: 'Internet',
  category_name: 'Habitação',
  description: null,
  default_amount: 150,
  category_id: 'cat-1',
  group_type: 'essenciais',
  source: 'projecao',
  is_active: true,
  due_day: 10,
  reminder_enabled: true,
  reminder_days_before: [2],
  reminder_on_due_date: true,
  created_at: '2026-03-01T00:00:00.000Z',
  updated_at: '2026-03-01T00:00:00.000Z',
  ...partial,
});

describe('buildMonthlyProjectionItems', () => {
  it('combina templates ativos com override mensal sem alterar a base global', () => {
    const templates: ProjectionTemplate[] = [buildTemplate({})];

    const overrides: MonthlyProjectionOverride[] = [
      {
        id: 'template-1:2026-3',
        user_id: 'user-1',
        template_id: 'template-1',
        month: 3,
        year: 2026,
        amount_override: 180,
        title_override: 'Internet abril',
        status: 'edited',
        paid_transaction_id: null,
        updated_at: '2026-04-01T00:00:00.000Z',
      },
    ];

    const items = buildMonthlyProjectionItems({
      templates,
      overrides,
      month: 3,
      year: 2026,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: 'Internet abril',
      account_name: 'Internet',
      category_name: 'Habitação',
      amount: 180,
      status: 'edited',
      is_overridden: true,
      due_day: 10,
      reminder_enabled: true,
      reminder_days_before: [2],
      reminder_on_due_date: true,
    });
    expect(templates[0].title).toBe('Internet');
    expect(templates[0].default_amount).toBe(150);
  });

  it('ignora templates inativos e gera status previsto quando não há override', () => {
    const templates: ProjectionTemplate[] = [
      buildTemplate({
        title: 'Aluguel',
        account_name: 'Aluguel',
        category_name: 'Habitação',
        default_amount: 800,
      }),
      buildTemplate({
        id: 'template-2',
        title: 'Academia',
        account_name: 'Academia',
        category_name: 'Hobbies',
        default_amount: 120,
        category_id: 'cat-2',
        group_type: 'desejos',
        is_active: false,
        due_day: null,
        reminder_enabled: null,
        reminder_days_before: [],
        reminder_on_due_date: null,
      }),
    ];

    const items = buildMonthlyProjectionItems({
      templates,
      overrides: [],
      month: 2,
      year: 2026,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: 'Aluguel',
      account_name: 'Aluguel',
      category_name: 'Habitação',
      amount: 800,
      status: 'predicted',
      is_overridden: false,
    });
  });
});
