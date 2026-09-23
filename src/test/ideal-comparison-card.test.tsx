import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import IdealComparisonCard from '@/components/IdealComparisonCard';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Bar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  LabelList: () => <div />,
  ReferenceLine: () => <div />,
}));

describe('IdealComparisonCard', () => {
  it('mantém a seção visível mesmo quando todos os grupos estão zerados', () => {
    render(
      <IdealComparisonCard
        title="Seu mês comparado ao ideal"
        groups={{ essenciais: 0, desejos: 0, prioridades: 0 }}
        emptyMessage="Nenhuma despesa real registrada neste mês."
      />,
    );

    expect(screen.getByLabelText('Seu mês comparado ao ideal')).toBeInTheDocument();
    expect(screen.getByText('Seu mês comparado ao ideal')).toBeInTheDocument();
    expect(screen.getByText('Essenciais')).toBeInTheDocument();
    expect(screen.getByText('Estilo de Vida')).toBeInTheDocument();
    expect(screen.getByText('Prioridades')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma despesa real registrada neste mês.')).toBeInTheDocument();
  });

  it('mostra os valores dos grupos recebidos sem depender da origem dos dados', () => {
    render(
      <IdealComparisonCard
        title="Planejamento do mês"
        groups={{ essenciais: 800, desejos: 0, prioridades: 0 }}
        emptyMessage="Nenhuma conta projetada ativa neste mês."
      />,
    );

    expect(screen.getByText('Planejamento do mês')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('800,00'))).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma conta projetada ativa neste mês.')).not.toBeInTheDocument();
  });
});
