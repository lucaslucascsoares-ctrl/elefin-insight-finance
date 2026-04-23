import { describe, expect, it } from 'vitest';
import { buildMonthlyForecastData, generateForecastInsight } from '@/lib/forecast';
import { Category, MonthlyForecastData, RecurringRule, Transaction } from '@/types/finance';

const categories: Category[] = [
  { id: 'cat-1', name: 'Moradia', group_type: 'essenciais', user_id: null },
  { id: 'cat-2', name: 'Lazer', group_type: 'desejos', user_id: null },
];

const transactions: Transaction[] = [
  {
    id: 'tx-1',
    created_at: '2026-02-10T12:00:00Z',
    user_id: 'user-1',
    type: 'expense',
    amount: 1200,
    category_id: 'cat-1',
    description: 'Aluguel',
    date: '2026-02-10',
  },
  {
    id: 'tx-2',
    created_at: '2026-02-11T12:00:00Z',
    user_id: 'user-1',
    type: 'expense',
    amount: 250,
    category_id: 'cat-2',
    description: 'Cinema',
    date: '2026-02-11',
  },
];

const recurringRules: RecurringRule[] = [
  {
    id: 'rule-1',
    user_id: 'user-1',
    type: 'expense',
    amount: 1300,
    category_id: 'cat-1',
    description: 'Aluguel',
    starts_at: '2026-02-10',
    active: true,
    created_at: '2026-02-10T12:00:00Z',
  },
];

describe('buildMonthlyForecastData', () => {
  it('prioritizes recurring items and uses history to complement without duplicating', () => {
    const result = buildMonthlyForecastData({
      userId: 'user-1',
      transactions,
      categories,
      recurringRules,
      month: 2,
      year: 2026,
    });

    expect(result).not.toBeNull();
    expect(result.totalGastoAnterior).toBe(1450);
    expect(result.totalPrevisto).toBe(1550);

    const essentials = result.categorias.find((item) => item.nome === 'Essenciais');
    const desires = result.categorias.find((item) => item.nome === 'Desejos');

    expect(essentials.previsaoMesAtual).toBe(1300);
    expect(essentials.itens).toHaveLength(1);
    expect(essentials.itens[0].source).toBe('recurring');

    expect(desires.previsaoMesAtual).toBe(250);
    expect(desires.itens).toHaveLength(1);
    expect(desires.itens[0].source).toBe('history');
  });

  it('ignores recurring rules that start in the same target month', () => {
    const result = buildMonthlyForecastData({
      userId: 'user-1',
      transactions,
      categories,
      recurringRules: [
        {
          id: 'rule-current-month',
          user_id: 'user-1',
          type: 'expense',
          amount: 999,
          category_id: 'cat-2',
          description: 'Cinema',
          starts_at: '2026-03-03',
          active: true,
          created_at: '2026-03-03T12:00:00Z',
        },
      ],
      month: 2,
      year: 2026,
    });

    expect(result.totalPrevisto).toBe(1450);

    const desires = result.categorias.find((item) => item.nome === 'Desejos');
    expect(desires.previsaoMesAtual).toBe(250);
    expect(desires.itens[0].source).toBe('history');
  });
});

describe('generateForecastInsight', () => {
  it('returns a neutral message when there is no forecast data', () => {
    const result = generateForecastInsight(null);

    expect(result.type).toBe('success');
    expect(result.message).toContain('Ainda não há previsões suficientes');
  });

  it('warns when priorities are below the target', () => {
    const data: MonthlyForecastData = {
      mesReferencia: 'mar�o',
      anoReferencia: 2026,
      categorias: [],
      totalGastoAnterior: 0,
      totalPrevisto: 1050,
      totalEntradaPrevisto: 1000,
      totalSaidaPrevisto: 450,
      incomeItems: [],
      expenseItems: [],
      groups: {
        essenciais: 500,
        desejos: 300,
        prioridades: 50,
      },
    };

    const result = generateForecastInsight(data);

    expect(result.type).toBe('warning');
    expect(result.message).toContain('Falta direcionar');
  });

  it('celebrates a balanced forecast', () => {
    const data: MonthlyForecastData = {
      mesReferencia: 'mar�o',
      anoReferencia: 2026,
      categorias: [],
      totalGastoAnterior: 0,
      totalPrevisto: 1000,
      totalEntradaPrevisto: 1000,
      totalSaidaPrevisto: 1000,
      incomeItems: [],
      expenseItems: [],
      groups: {
        essenciais: 500,
        desejos: 300,
        prioridades: 200,
      },
    };

    const result = generateForecastInsight(data);

    expect(result.type).toBe('success');
    expect(result.message).toContain('Sua previsão está equilibrada');
  });
});
