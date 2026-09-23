import { describe, expect, it } from 'vitest';
import { buildMonthlyForecastData } from '@/lib/forecast';
import { buildForecastDetailDashboardData, getForecastDetailWindow } from '@/lib/forecastDetail';
import { Category, RecurringRule, Transaction } from '@/types/finance';

const today = new Date(2026, 8, 23, 15, 30);

const toKey = (date: Date | null) => (date ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` : null);

const categories: Category[] = [
  { id: 'cat-home', name: 'Moradia', group_type: 'essenciais', user_id: null },
  { id: 'cat-fun', name: 'Lazer', group_type: 'desejos', user_id: null },
];

const tx = (id: string, date: string, type: Transaction['type'], amount: number, categoryId: string | null, description: string): Transaction => ({
  id,
  created_at: `${date}T12:00:00Z`,
  user_id: 'user-1',
  type,
  amount,
  category_id: categoryId,
  description,
  date,
});

// Março serve de histórico para a previsão de abril.
const transactions: Transaction[] = [
  tx('mar-salary', '2026-03-05', 'income', 6000, null, 'Salário'),
  tx('mar-fun', '2026-03-12', 'expense', 610, 'cat-fun', 'Cinema'),
];

const recurringRules: RecurringRule[] = [
  {
    id: 'rule-rent',
    user_id: 'user-1',
    type: 'expense',
    amount: 2000,
    category_id: 'cat-home',
    description: 'Aluguel',
    starts_at: '2026-02-10',
    active: true,
    created_at: '2026-02-10T12:00:00Z',
  },
];

const forecastFor = (month: number, year: number, txs = transactions) =>
  buildMonthlyForecastData({ userId: 'user-1', transactions: txs, categories, recurringRules, month, year });

describe('getForecastDetailWindow', () => {
  it('parte de hoje no mês atual', () => {
    const window = getForecastDetailWindow(8, 2026, today);
    expect(window.mode).toBe('current');
    expect(toKey(window.realizedUntil)).toBe('2026-9-23');
    expect(window.windowStartLabel).toContain('23 de setembro');
  });

  it('cobre o mês inteiro, já realizado, em meses passados', () => {
    const window = getForecastDetailWindow(3, 2026, today);
    expect(window.mode).toBe('past');
    expect(toKey(window.realizedUntil)).toBe('2026-4-30');
    expect(window.windowStartLabel).toContain('01 de abril de 2026');
    expect(window.windowEndLabel).toContain('30 de abril de 2026');
  });

  it('cobre o mês inteiro, só previsto, em meses futuros', () => {
    const window = getForecastDetailWindow(0, 2027, today);
    expect(window.mode).toBe('future');
    expect(window.realizedUntil).toBeNull();
    expect(window.windowStartLabel).toContain('01 de janeiro de 2027');
  });
});

describe('buildForecastDetailDashboardData', () => {
  it('em um mês futuro usa os mesmos totais do card de Previsão', () => {
    const forecastData = forecastFor(3, 2026);
    const detail = buildForecastDetailDashboardData({
      forecastData,
      transactions,
      categories,
      recurringRules,
      caixaInicial: 1000,
      month: 3,
      year: 2026,
      today: new Date(2026, 2, 20),
    });

    expect(forecastData?.totalEntradaPrevisto).toBe(6000);
    expect(forecastData?.totalSaidaPrevisto).toBe(2610);
    expect(detail.mode).toBe('future');
    expect(detail.projectedIncome).toBe(6000);
    expect(detail.projectedExpense).toBe(2610);
    expect(detail.currentBalance).toBe(1000);
    expect(detail.projectedBalance).toBe(1000 + 6000 - 2610);
    expect(detail.pieSlices.find((slice) => slice.key === 'essenciais')?.value).toBe(2000);
    expect(detail.pieSlices.find((slice) => slice.key === 'desejos')?.value).toBe(610);
    // Salário cai no dia 5, aluguel no dia 10, lazer no dia 12.
    expect(detail.linePoints[3].projectedBalance).toBe(1000);
    expect(detail.linePoints[4].projectedBalance).toBe(7000);
    expect(detail.linePoints[9].projectedBalance).toBe(5000);
    expect(detail.linePoints.at(-1)?.projectedBalance).toBe(4390);
  });

  it('no mês atual soma o realizado até hoje com o previsto que ainda vence', () => {
    const aprilTx = [...transactions, tx('apr-salary', '2026-04-05', 'income', 6100, null, 'Salário')];
    const detail = buildForecastDetailDashboardData({
      forecastData: forecastFor(3, 2026, aprilTx),
      transactions: aprilTx,
      categories,
      recurringRules,
      caixaInicial: 1000,
      month: 3,
      year: 2026,
      today: new Date(2026, 3, 8, 9),
    });

    expect(detail.mode).toBe('current');
    expect(detail.actualIncome).toBe(6100);
    // Salário previsto (dia 5) já passou e é coberto pelo realizado; aluguel (10) e lazer (12) ainda vêm.
    expect(detail.projectedIncome).toBe(6100);
    expect(detail.projectedExpense).toBe(2610);
    expect(detail.currentBalance).toBe(7100);
    expect(detail.projectedBalance).toBe(7100 - 2610);
    expect(detail.linePoints.find((point) => point.isCurrentDay)?.label).toContain('08');
  });

  it('em um mês passado mostra só o realizado', () => {
    const detail = buildForecastDetailDashboardData({
      forecastData: forecastFor(2, 2026),
      transactions,
      categories,
      recurringRules,
      caixaInicial: 0,
      month: 2,
      year: 2026,
      today,
    });

    expect(detail.mode).toBe('past');
    expect(detail.actualIncome).toBe(6000);
    expect(detail.actualExpense).toBe(610);
    expect(detail.projectedBalance).toBe(5390);
    expect(detail.currentBalanceLabel).toBe('Saldo final');
  });
});
