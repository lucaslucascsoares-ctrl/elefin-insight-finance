import { describe, expect, it } from 'vitest';
import { buildMonthlyProjectionItems } from '@/lib/projections';
import { MonthlyProjectionOverride, ProjectionTemplate } from '@/types/finance';

describe('buildMonthlyProjectionItems', () => {
  it('combina templates ativos com override mensal sem alterar a base global', () => {
    const templates: ProjectionTemplate[] = [
      {
        id: 'template-1',
        user_id: 'user-1',
        title: 'Internet',
        account_name: 'Internet',
        category_name: 'Habitacao',
        description: null,
        default_amount: 150,
        category_id: 'cat-1',
        group_type: 'essenciais',
        source: 'projecao',
        is_active: true,
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
      },
    ];

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
      category_name: 'Habitacao',
      amount: 180,
      status: 'edited',
      is_overridden: true,
    });
    expect(templates[0].title).toBe('Internet');
    expect(templates[0].default_amount).toBe(150);
  });

  it('ignora templates inativos e gera status previsto quando não há override', () => {
    const templates: ProjectionTemplate[] = [
      {
        id: 'template-1',
        user_id: 'user-1',
        title: 'Aluguel',
        account_name: 'Aluguel',
        category_name: 'Habitacao',
        description: null,
        default_amount: 800,
        category_id: 'cat-1',
        group_type: 'essenciais',
        source: 'projecao',
        is_active: true,
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
      },
      {
        id: 'template-2',
        user_id: 'user-1',
        title: 'Academia',
        account_name: 'Academia',
        category_name: 'Hobbies',
        description: null,
        default_amount: 120,
        category_id: 'cat-2',
        group_type: 'desejos',
        source: 'projecao',
        is_active: false,
        created_at: '2026-03-01T00:00:00.000Z',
        updated_at: '2026-03-01T00:00:00.000Z',
      },
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
      category_name: 'Habitacao',
      amount: 800,
      status: 'predicted',
      is_overridden: false,
    });
  });
});
