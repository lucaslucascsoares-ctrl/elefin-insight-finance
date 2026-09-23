// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DashboardCarousel from '@/components/DashboardCarousel';

vi.mock('@/components/FinanceMonthCard', () => ({
  default: () => <div>finance-card</div>,
}));

vi.mock('@/components/ForecastMonthCard', () => ({
  default: () => <div>forecast-card</div>,
}));

vi.mock('@/components/IdealComparisonCard', () => ({
  default: () => <div>ideal-card</div>,
}));

vi.mock('@/components/ProjectedMonthCard', () => ({
  default: () => <div>projected-card</div>,
}));

describe('DashboardCarousel copy', () => {
  it('renders dashboard actions with UTF-8 copy', () => {
    render(
      <DashboardCarousel
        transactions={[]}
        categories={[]}
        projectedItems={[]}
        caixaInicial={0}
        onDeleteProjectionTemplate={vi.fn()}
        forecastData={null}
        currentMonthLabel="abril"
        currentMonthShortLabel="abr/26"
        previousMonthShortLabel="mar/26"
        onOpenIncome={vi.fn()}
        onOpenExpense={vi.fn()}
        onOpenGeneric={vi.fn()}
        onOpenProjection={vi.fn()}
        onOpenForecastDetail={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '+ Nova Movimentação' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previsão detalhada do mês' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Projeção de Gastos' })).toBeInTheDocument();
  });
});
