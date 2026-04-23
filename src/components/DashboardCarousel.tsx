import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FinanceMonthCard from '@/components/FinanceMonthCard';
import ForecastMonthCard from '@/components/ForecastMonthCard';
import IdealComparisonCard from '@/components/IdealComparisonCard';
import ProjectedMonthCard from '@/components/ProjectedMonthCard';
import { getProjectedMonthData, getRealMonthData } from '@/lib/dashboardData';
import { Category, MonthlyForecastData, MonthlyProjectionItem, Transaction } from '@/types/finance';

type DashboardView = 'real' | 'forecast' | 'projection';

interface DashboardCarouselProps {
  transactions: Transaction[];
  categories: Category[];
  projectedItems: MonthlyProjectionItem[];
  caixaInicial: number;
  forecastData: MonthlyForecastData | null;
  currentMonthLabel: string;
  currentMonthShortLabel: string;
  previousMonthShortLabel: string;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenGeneric: () => void;
  onOpenProjection: () => void;
  onOpenForecastDetail: () => void;
  onDeleteProjectionTemplate: (templateId: string) => Promise<void> | void;
}

const dashboardTabs: { key: DashboardView; label: string; description: string }[] = [
  {
    key: 'real',
    label: 'Real',
    description: 'Lançamentos reais e saldo efetivo do mês',
  },
  {
    key: 'forecast',
    label: 'Previsão',
    description: 'Leitura baseada no mês anterior',
  },
  {
    key: 'projection',
    label: 'Planejamento',
    description: 'Contas projetadas e valores previstos do mês',
  },
];

const DashboardCarousel = ({
  transactions,
  categories,
  projectedItems,
  caixaInicial,
  forecastData,
  currentMonthLabel,
  currentMonthShortLabel,
  previousMonthShortLabel,
  onOpenIncome,
  onOpenExpense,
  onOpenGeneric,
  onOpenProjection,
  onOpenForecastDetail,
  onDeleteProjectionTemplate,
}: DashboardCarouselProps) => {
  const [currentDashboard, setCurrentDashboard] = useState<DashboardView>('real');
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
    scrollToDashboard('real', 'auto');

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
    <section className="pt-0.5" data-testid="dashboard-carousel">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="mt-3 flex items-start snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="min-w-full basis-full shrink-0 snap-center" data-testid="dashboard-slide-real">
          <FinanceMonthCard
            transactions={transactions}
            categories={categories}
            caixaInicial={caixaInicial}
            onOpenIncome={onOpenIncome}
            onOpenExpense={onOpenExpense}
            onOpenGeneric={onOpenGeneric}
          />
          <div className="mt-3">
            <IdealComparisonCard
              title={'Seu mês comparado ao ideal'}
              groups={realData.groups}
            />
          </div>
          <button
            type="button"
            data-testid="new-transaction-button"
            onClick={onOpenGeneric}
            className="mt-3 flex h-13 w-full items-center justify-center rounded-[20px] border border-emerald-100/80 bg-[linear-gradient(180deg,#FFFFFF,#F3F8F5)] px-5 text-center text-[0.95rem] font-semibold tracking-[-0.02em] text-slate-900 shadow-[0_12px_24px_rgba(92,134,109,0.08)] transition-all hover:-translate-y-[1px] hover:bg-[linear-gradient(180deg,#FFFFFF,#EEF6F1)] min-[380px]:h-14 min-[380px]:rounded-[22px] min-[380px]:px-6 min-[380px]:text-[1rem] dark:border-[#c99755] dark:bg-[linear-gradient(180deg,#d9a55f,#c6904f)] dark:text-[#182019] dark:shadow-[0_18px_34px_rgba(0,0,0,0.28)] dark:hover:bg-[linear-gradient(180deg,#e1af68,#ca9655)]"
          >
            + Nova Movimentação
          </button>
        </div>

        <div className="min-w-full basis-full shrink-0 snap-center" data-testid="dashboard-slide-forecast">
          <ForecastMonthCard data={forecastData} />
          <button
            type="button"
            data-testid="forecast-month-detail-trigger"
            onClick={onOpenForecastDetail}
            className="mt-3 flex h-13 w-full items-center justify-center rounded-[20px] border border-emerald-100/80 bg-[linear-gradient(180deg,#FFFFFF,#F3F8F5)] px-5 text-center text-[0.95rem] font-semibold tracking-[-0.02em] text-slate-900 shadow-[0_12px_24px_rgba(92,134,109,0.08)] transition-all hover:-translate-y-[1px] hover:bg-[linear-gradient(180deg,#FFFFFF,#EEF6F1)] min-[380px]:h-14 min-[380px]:rounded-[22px] min-[380px]:px-6 min-[380px]:text-[1rem] dark:border-[#c99755] dark:bg-[linear-gradient(180deg,#d9a55f,#c6904f)] dark:text-[#182019] dark:shadow-[0_18px_34px_rgba(0,0,0,0.28)] dark:hover:bg-[linear-gradient(180deg,#e1af68,#ca9655)]"
          >
            Previsão detalhada do mês
          </button>
        </div>

        <div className="min-w-full basis-full shrink-0 snap-center" data-testid="dashboard-slide-projection">
          <ProjectedMonthCard
            items={projectedData.activeItems}
            onDeleteTemplate={onDeleteProjectionTemplate}
          />
          <div className="mt-3">
            <IdealComparisonCard
              title={'Seu mês comparado ao ideal'}
              groups={projectedData.groups}
            />
          </div>
          <button
            type="button"
            data-testid="new-transaction-button-projection"
            onClick={onOpenProjection}
            className="mt-3 flex h-13 w-full items-center justify-center rounded-[20px] border border-emerald-100/80 bg-[linear-gradient(180deg,#FFFFFF,#F3F8F5)] px-5 text-center text-[0.95rem] font-semibold tracking-[-0.02em] text-slate-900 shadow-[0_12px_24px_rgba(92,134,109,0.08)] transition-all hover:-translate-y-[1px] hover:bg-[linear-gradient(180deg,#FFFFFF,#EEF6F1)] min-[380px]:h-14 min-[380px]:rounded-[22px] min-[380px]:px-6 min-[380px]:text-[1rem] dark:border-[#c99755] dark:bg-[linear-gradient(180deg,#d9a55f,#c6904f)] dark:text-[#182019] dark:shadow-[0_18px_34px_rgba(0,0,0,0.28)] dark:hover:bg-[linear-gradient(180deg,#e1af68,#ca9655)]"
          >
            Projeção de Gastos
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {dashboardTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-label={`Ir para dashboard ${tab.label}`}
            onClick={() => scrollToDashboard(tab.key, 'auto')}
            className={`h-2.5 rounded-full transition-all ${
              currentDashboard === tab.key ? 'w-8 bg-slate-900 dark:bg-[#ABBC82]' : 'w-2.5 bg-slate-300 dark:bg-[#233027]'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default DashboardCarousel;
