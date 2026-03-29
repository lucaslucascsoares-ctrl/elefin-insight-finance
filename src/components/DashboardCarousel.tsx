import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FinanceMonthCard from '@/components/FinanceMonthCard';
import IdealComparisonCard from '@/components/IdealComparisonCard';
import ProjectedMonthCard from '@/components/ProjectedMonthCard';
import { getProjectedMonthData, getRealMonthData } from '@/lib/dashboardData';
import { Category, MonthlyProjectionItem, Transaction } from '@/types/finance';

type DashboardView = 'projection' | 'real';

interface DashboardCarouselProps {
  transactions: Transaction[];
  categories: Category[];
  projectedItems: MonthlyProjectionItem[];
  caixaInicial: number;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenGeneric: () => void;
}

const dashboardTabs: { key: DashboardView; label: string; description: string }[] = [
  {
    key: 'projection',
    label: 'Planejamento',
    description: 'Contas projetadas e valores previstos do m\u00EAs',
  },
  {
    key: 'real',
    label: 'Real',
    description: 'Lan\u00E7amentos reais e saldo efetivo do m\u00EAs',
  },
];

const DashboardCarousel = ({
  transactions,
  categories,
  projectedItems,
  caixaInicial,
  onOpenIncome,
  onOpenExpense,
  onOpenGeneric,
}: DashboardCarouselProps) => {
  const [currentDashboard, setCurrentDashboard] = useState<DashboardView>('projection');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSyncingScrollRef = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);

  const projectedData = useMemo(() => getProjectedMonthData(projectedItems), [projectedItems]);
  const realData = useMemo(
    () => getRealMonthData(transactions, categories, caixaInicial),
    [transactions, categories, caixaInicial],
  );

  const releaseScrollSync = useCallback(() => {
    if (syncTimeoutRef.current !== null) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      isSyncingScrollRef.current = false;
      syncTimeoutRef.current = null;
    }, 220);
  }, []);

  const scrollToDashboard = useCallback(
    (dashboard: DashboardView, behavior: ScrollBehavior = 'auto') => {
      const container = containerRef.current;
      if (!container) return;

      const slideIndex = dashboardTabs.findIndex((item) => item.key === dashboard);
      const nextLeft = slideIndex * container.clientWidth;

      isSyncingScrollRef.current = true;
      setCurrentDashboard(dashboard);

      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ left: nextLeft, behavior });
      } else {
        container.scrollLeft = nextLeft;
      }

      releaseScrollSync();
    },
    [releaseScrollSync],
  );

  useEffect(() => {
    scrollToDashboard('projection', 'auto');

    return () => {
      if (syncTimeoutRef.current !== null) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [scrollToDashboard]);

  useEffect(() => {
    const handleResize = () => {
      scrollToDashboard(currentDashboard, 'auto');
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentDashboard, scrollToDashboard]);

  const handleScroll = useCallback(() => {
    if (isSyncingScrollRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const index = Math.round(container.scrollLeft / Math.max(container.clientWidth, 1));
    const nextDashboard = dashboardTabs[index]?.key;

    if (nextDashboard && nextDashboard !== currentDashboard) {
      setCurrentDashboard(nextDashboard);
    }
  }, [currentDashboard]);

  return (
    <section className="pt-1" data-testid="dashboard-carousel">
      <div className="px-4">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-2 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-2 gap-2">
            {dashboardTabs.map((tab) => {
              const active = currentDashboard === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  data-testid={`dashboard-tab-${tab.key}`}
                  translate="no"
                  onClick={() => scrollToDashboard(tab.key, 'auto')}
                  className={`notranslate min-h-[88px] rounded-[18px] px-4 py-3 text-left transition-all ${
                    active ? 'bg-slate-900 text-white shadow-[0_14px_26px_rgba(15,23,42,0.18)]' : 'bg-transparent text-slate-600'
                  }`}
                >
                  <span
                    translate="no"
                    className={`notranslate block text-sm font-semibold leading-5 ${active ? 'text-white' : 'text-foreground'}`}
                  >
                    {tab.label}
                  </span>
                  <span
                    translate="no"
                    className={`notranslate mt-1 block text-xs leading-5 ${active ? 'text-white/70' : 'text-slate-500'}`}
                  >
                    {tab.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="mt-4 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="w-full shrink-0 snap-center" data-testid="dashboard-slide-projection">
          <ProjectedMonthCard items={projectedData.activeItems} />
          <IdealComparisonCard
            title={'Planejamento do m\u00EAs'}
            groups={projectedData.groups}
            emptyMessage={'Nenhuma conta projetada ativa neste m\u00EAs.'}
          />
        </div>

        <div className="w-full shrink-0 snap-center" data-testid="dashboard-slide-real">
          <FinanceMonthCard
            transactions={transactions}
            caixaInicial={caixaInicial}
            onOpenIncome={onOpenIncome}
            onOpenExpense={onOpenExpense}
            onOpenGeneric={onOpenGeneric}
          />
          <IdealComparisonCard
            title={'Seu m\u00EAs comparado ao ideal'}
            groups={realData.groups}
            emptyMessage={'Nenhuma despesa real registrada neste m\u00EAs.'}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {dashboardTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-label={`Ir para dashboard ${tab.label}`}
            onClick={() => scrollToDashboard(tab.key, 'auto')}
            className={`h-2.5 rounded-full transition-all ${
              currentDashboard === tab.key ? 'w-8 bg-slate-900' : 'w-2.5 bg-slate-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default DashboardCarousel;
