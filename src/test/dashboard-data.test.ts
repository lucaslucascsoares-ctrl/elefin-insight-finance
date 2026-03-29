import { describe, expect, it } from 'vitest';
import { getProjectedMonthData, getRealMonthData } from '@/lib/dashboardData';
import { Category, MonthlyProjectionItem, Transaction } from '@/types/finance';

describe('dashboardData', () => {
  it('mantém contas projetadas apenas na visão de planejamento', () => {
    const items: MonthlyProjectionItem[] = [
      {
        id: 'proj-1',
        template_id: 'tpl-1',
        user_id: 'user-1',
        month: 3,
        year: 2026,
        title: 'Aluguel',
        account_name: 'Aluguel',
        category_name: 'Moradia',
        amount: 1000,
        category_id: 'cat-1',
        group_type: 'essenciais',
        status: 'predicted',
        paid_transaction_id: null,
        is_overridden: false,
        due_day: 10,
        reminder_enabled: true,
        reminder_days_before: [2],
        reminder_on_due_date: true,
      },
      {
        id: 'proj-2',
        template_id: 'tpl-2',
        user_id: 'user-1',
        month: 3,
        year: 2026,
        title: 'Streaming',
        account_name: 'Streaming',
        category_name: 'Assinaturas',
        amount: 80,
        category_id: 'cat-2',
        group_type: 'desejos',
        status: 'ignored',
        paid_transaction_id: null,
        is_overridden: false,
        due_day: null,
        reminder_enabled: false,
        reminder_days_before: [],
        reminder_on_due_date: false,
      },
      {
        id: 'proj-3',
        template_id: 'tpl-3',
        user_id: 'user-1',
        month: 3,
        year: 2026,
        title: 'Reserva',
        account_name: 'Reserva',
        category_name: 'Investimentos',
        amount: 200,
        category_id: 'cat-3',
        group_type: 'prioridades',
        status: 'paid',
        paid_transaction_id: 'tx-9',
        is_overridden: false,
        due_day: null,
        reminder_enabled: false,
        reminder_days_before: [],
        reminder_on_due_date: false,
      },
    ];

    const result = getProjectedMonthData(items);

    expect(result.total).toBe(1000);
    expect(result.groups).toEqual({ essenciais: 1000, desejos: 0, prioridades: 0 });
    expect(result.pendingItemsCount).toBe(1);
  });

  it('usa apenas lançamentos reais na visão de execução', () => {
    const categories: Category[] = [
      { id: 'cat-1', name: 'Moradia', group_type: 'essenciais' },
      { id: 'cat-2', name: 'Lazer', group_type: 'desejos' },
    ];

    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        created_at: '2026-04-05T10:00:00.000Z',
        user_id: 'user-1',
        type: 'income',
        amount: 5000,
        category_id: null,
        description: 'Salário',
        date: '2026-04-05',
      },
      {
        id: 'tx-2',
        created_at: '2026-04-06T10:00:00.000Z',
        user_id: 'user-1',
        type: 'expense',
        amount: 1000,
        category_id: 'cat-1',
        description: 'Aluguel pago',
        date: '2026-04-06',
      },
    ];

    const result = getRealMonthData(transactions, categories, 300);

    expect(result.totalIncome).toBe(5000);
    expect(result.totalExpense).toBe(1000);
    expect(result.saldo).toBe(4300);
    expect(result.groups).toEqual({ essenciais: 1000, desejos: 0, prioridades: 0 });
  });
});
