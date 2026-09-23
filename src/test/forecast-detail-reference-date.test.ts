import { describe, expect, it } from 'vitest';
import { getForecastAnalysisWindow, getForecastDetailReferenceDate } from '@/lib/forecastDetail';

const today = new Date(2026, 8, 23, 15, 30);

const toKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

describe('getForecastDetailReferenceDate', () => {
  it('usa o dia de hoje quando o mês selecionado é o atual', () => {
    expect(toKey(getForecastDetailReferenceDate(8, 2026, today))).toBe('2026-9-23');
  });

  it('usa o último dia do mês quando o mês selecionado já passou', () => {
    expect(toKey(getForecastDetailReferenceDate(3, 2026, today))).toBe('2026-4-30');
    expect(toKey(getForecastDetailReferenceDate(1, 2024, today))).toBe('2024-2-29');
  });

  it('usa o primeiro dia do mês quando o mês selecionado é futuro', () => {
    expect(toKey(getForecastDetailReferenceDate(0, 2027, today))).toBe('2027-1-1');
  });

  it('mantém a janela de análise dentro do mês selecionado', () => {
    const window = getForecastAnalysisWindow(getForecastDetailReferenceDate(3, 2026, today));

    expect(toKey(window.monthStart)).toBe('2026-4-1');
    expect(toKey(window.monthEnd)).toBe('2026-4-30');
    expect(window.windowEndLabel).toContain('abril de 2026');
  });
});
