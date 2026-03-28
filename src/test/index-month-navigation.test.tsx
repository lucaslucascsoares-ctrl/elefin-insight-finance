// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Index from '@/pages/Index';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/DashboardHeader', () => ({
  default: () => <div>header</div>,
}));

vi.mock('@/components/IdealComparisonCard', () => ({
  default: () => <div>ideal-card</div>,
}));

vi.mock('@/components/IdealComparison', () => ({
  default: () => <div>ideal-accordion</div>,
}));

vi.mock('@/components/InsightsAccordion', () => ({
  default: () => <div>insights</div>,
}));

vi.mock('@/components/RecentTransactions', () => ({
  default: () => <div>transactions</div>,
}));

vi.mock('@/components/NewTransactionModal', () => ({
  default: () => null,
}));

vi.mock('@/components/FAB', () => ({
  default: () => <button type="button">fab</button>,
}));

vi.mock('@/components/FinanceMonthCard', () => ({
  default: ({ caixaInicial }: { caixaInicial: number }) => <div>finance-card-{caixaInicial}</div>,
}));

vi.mock('@/components/PreviousMonthForecastCard', () => ({
  default: () => <div>forecast</div>,
}));

vi.mock('@/components/projection/ProjectionMonthlySection', () => ({
  default: () => <div>projection-monthly</div>,
}));

vi.mock('@/pages/Auth', () => ({
  default: () => <div>auth-page</div>,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    session: { user: { id: 'user-1' } },
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useAddTransaction: () => ({
    mutate: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/useMonthBalance', () => ({
  useMonthBalance: () => ({
    data: null,
    isLoading: false,
  }),
  useEnsureMonthBalance: () => ({
    isPending: false,
    mutate: vi.fn(),
  }),
}));

vi.mock('@/hooks/useRecurringRules', () => ({
  useRecurringRules: () => ({
    activeRules: [],
    isLoading: false,
    saveRule: vi.fn(),
    removeRule: vi.fn(),
    toggleRule: vi.fn(),
  }),
}));

vi.mock('@/hooks/useProjectionTemplates', () => ({
  useProjectionTemplates: () => ({
    templates: [],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useMonthlyProjectionItems', () => ({
  useMonthlyProjectionItems: () => ({
    items: [],
    isLoading: false,
    saveOverride: vi.fn(),
    clearOverride: vi.fn(),
  }),
}));

describe('Index month navigation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-27T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('moves back to previous month and forward up to 12 months ahead without breaking state', () => {
    render(<Index />);

    expect(normalize(screen.getByText(/2026/i).textContent || '')).toContain('marco');

    fireEvent.click(screen.getByRole('button', { name: /voltar um mês/i }));
    expect(normalize(screen.getByText(/2026/i).textContent || '')).toContain('fevereiro');

    const nextButton = screen.getByRole('button', { name: /avançar um mês/i });
    fireEvent.click(nextButton);

    expect(normalize(screen.getByText(/2026/i).textContent || '')).toContain('marco');
    fireEvent.click(nextButton);

    expect(normalize(screen.getByText(/2026/i).textContent || '')).toContain('abril');

    for (let index = 0; index < 11; index += 1) {
      fireEvent.click(nextButton);
    }

    expect(normalize(screen.getByText(/2027/i).textContent || '')).toContain('marco');
    expect(nextButton).toBeDisabled();
  });
});
