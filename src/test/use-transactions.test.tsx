import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTransactions } from '@/hooks/useTransactions';

const TOTAL_ROWS = 2345;
const rangeCalls: Array<[number, number]> = [];

vi.mock('@/integrations/supabase/client', () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    range: async (from: number, to: number) => {
      rangeCalls.push([from, to]);
      const end = Math.min(to + 1, TOTAL_ROWS);
      const data = Array.from({ length: Math.max(end - from, 0) }, (_, index) => ({ id: `tx-${from + index}` }));
      return { data, error: null };
    },
  };

  return {
    supabase: { from: () => builder },
    isSupabaseConfigured: true,
  };
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useTransactions', () => {
  it('busca todas as transações em páginas, além do limite de 1000 linhas', async () => {
    const { result } = renderHook(() => useTransactions('user-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(TOTAL_ROWS);
    expect(rangeCalls).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ]);
  });
});
