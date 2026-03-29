import { describe, expect, it } from 'vitest';
import { filterTransactionsByMonth, getMonthPartsFromDateString, isDateBeforeMonth, isDateInMonth } from '@/lib/monthFilters';
import { Transaction } from '@/types/finance';

describe('monthFilters', () => {
  it('considera ano e mês ao filtrar transações', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-mar',
        created_at: '2026-03-10T10:00:00.000Z',
        user_id: 'user-1',
        type: 'expense',
        amount: 1000,
        category_id: 'cat-1',
        description: 'Março',
        date: '2026-03-31',
      },
      {
        id: 'tx-apr',
        created_at: '2026-04-10T10:00:00.000Z',
        user_id: 'user-1',
        type: 'expense',
        amount: 500,
        category_id: 'cat-1',
        description: 'Abril',
        date: '2026-04-01',
      },
      {
        id: 'tx-mar-next-year',
        created_at: '2027-03-10T10:00:00.000Z',
        user_id: 'user-1',
        type: 'expense',
        amount: 300,
        category_id: 'cat-1',
        description: 'Março de outro ano',
        date: '2027-03-01',
      },
    ];

    expect(filterTransactionsByMonth(transactions, 2, 2026).map((item) => item.id)).toEqual(['tx-mar']);
    expect(filterTransactionsByMonth(transactions, 3, 2026).map((item) => item.id)).toEqual(['tx-apr']);
  });

  it('faz parsing seguro pelo prefixo YYYY-MM-DD sem deslocar por timezone', () => {
    expect(getMonthPartsFromDateString('2026-03-31T23:59:59.000Z')).toEqual({ year: 2026, month: 2, day: 31 });
    expect(getMonthPartsFromDateString('2026-04-01T00:00:00.000Z')).toEqual({ year: 2026, month: 3, day: 1 });
    expect(isDateInMonth('2026-03-31T23:59:59.000Z', 2, 2026)).toBe(true);
    expect(isDateInMonth('2026-03-31T23:59:59.000Z', 3, 2026)).toBe(false);
  });

  it('identifica corretamente datas de meses anteriores para o caixa inicial', () => {
    expect(isDateBeforeMonth('2026-03-31', 3, 2026)).toBe(true);
    expect(isDateBeforeMonth('2026-04-01', 3, 2026)).toBe(false);
    expect(isDateBeforeMonth('2025-12-20', 0, 2026)).toBe(true);
  });
});
