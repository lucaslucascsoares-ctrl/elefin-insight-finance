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
    description: 'Contas projetadas e valores previstos do mes',
  },
  {
    key: 'real',
    label: 'Real',
    description: 'Lancamentos reais e saldo efetivo do mes',
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
        <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-2 shadow-[0_14px_28px_rgba(15,23,42,0.05)] dark:border-[#263731] dark:bg-[#16211D] dark:shadow-[0_16px_32px_rgba(3,10,8,0.34)]">
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
                    active
                      ? 'bg-slate-900 text-white shadow-[0_14px_26px_rgba(15,23,42,0.18)] dark:bg-[linear-gradient(180deg,#3F8C74,#2F6F5E)] dark:text-[#F1F8F4] dark:shadow-[0_14px_30px_rgba(4,17,13,0.32)]'
                      : 'bg-transparent text-slate-600 dark:text-[#B8CBC3]'
                  }`}
                >
                  <span
                    translate="no"
                    className={`notranslate block text-sm font-semibold leading-5 ${active ? 'text-white dark:text-[#F1F8F4]' : 'text-foreground dark:text-[#E6F2EE]'}`}
                  >
                    {tab.label}
                  </span>
                  <span
                    translate="no"
                    className={`notranslate mt-1 block text-xs leading-5 ${active ? 'text-white/70 dark:text-[#D7E8E1]' : 'text-slate-500 dark:text-[#8EA39B]'}`}
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
            title={'Planejamento do mes'}
            groups={projectedData.groups}
            emptyMessage={'Nenhuma conta projetada ativa neste mes.'}
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
            title={'Seu mes comparado ao ideal'}
            groups={realData.groups}
            emptyMessage={'Nenhuma despesa real registrada neste mes.'}
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
              currentDashboard === tab.key ? 'w-8 bg-slate-900 dark:bg-[#6FB7A1]' : 'w-2.5 bg-slate-300 dark:bg-[#263731]'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default DashboardCarousel;
