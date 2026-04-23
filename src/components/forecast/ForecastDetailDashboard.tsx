import { useMemo } from 'react';
import BalanceSummaryCard from '@/components/BalanceSummaryCard';
import type { Category, MonthlyProjectionItem, RecurringRule, Transaction } from '@/types/finance';
import {
  buildForecastDetailDashboardData,
  ForecastDetailDashboardData,
} from '@/lib/forecastDetail';
import ForecastPieChart from '@/components/forecast/ForecastPieChart';
import ForecastTrendChart from '@/components/forecast/ForecastTrendChart';

interface ForecastDetailDashboardProps {
  transactions: Transaction[];
  categories: Category[];
  projectedItems: MonthlyProjectionItem[];
  recurringRules: RecurringRule[];
  caixaInicial: number;
  referenceDate: Date;
}

const ForecastDetailDashboard = ({
  transactions,
  categories,
  projectedItems,
  recurringRules,
  caixaInicial,
  referenceDate,
}: ForecastDetailDashboardProps) => {
  const detail = useMemo(
    () =>
      buildForecastDetailDashboardData({
        transactions,
        categories,
        recurringRules,
        projectedItems,
        caixaInicial,
        referenceDate,
      }),
    [transactions, categories, recurringRules, projectedItems, caixaInicial, referenceDate],
  );

  return (
    <div className="space-y-4 px-1 pb-1 pt-2 min-[380px]:space-y-5">
      <HeaderCard detail={detail} />
      <PieCard detail={detail} />
      <TrendCard detail={detail} />
      <InsightCard detail={detail} />
    </div>
  );
};

const HeaderCard = ({ detail }: { detail: ForecastDetailDashboardData }) => (
  <div className="rounded-[28px] border border-border bg-card px-4 py-4 text-card-foreground shadow-[0_18px_38px_rgba(15,23,42,0.10)] min-[380px]:px-5 min-[380px]:py-5 dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.28)]">
    <div className="text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Previsão detalhada</p>
      <h2 className="mt-1 text-base font-semibold text-foreground min-[380px]:text-lg">
        {detail.windowStartLabel} até {detail.windowEndLabel}
      </h2>
      <p className="mt-2 text-[13px] leading-5 text-muted-foreground min-[380px]:text-sm min-[380px]:leading-6">
        A leitura é recalculada ao abrir o painel, usando a data local como ponto de partida.
      </p>
    </div>
  </div>
);

const PieCard = ({ detail }: { detail: ForecastDetailDashboardData }) => (
  <div className="min-w-0 rounded-[28px] border border-border bg-card px-3 py-4 text-card-foreground shadow-[0_18px_38px_rgba(15,23,42,0.10)] min-[380px]:px-5 min-[380px]:py-5 dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.28)]">
    <div className="mb-3 text-center lg:pl-[168px]">
      <h3 className="text-[1.12rem] font-bold tracking-[-0.02em] text-[#314238] min-[380px]:text-[1.2rem] dark:text-[#E6F2EE]">
        Composição da previsão
      </h3>
    </div>
    <ForecastPieChart slices={detail.pieSlices} />
  </div>
);

const TrendCard = ({ detail }: { detail: ForecastDetailDashboardData }) => (
  <div className="rounded-[28px] border border-border bg-card px-3 py-4 text-card-foreground shadow-[0_18px_38px_rgba(15,23,42,0.10)] min-[380px]:px-5 min-[380px]:py-5 dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.28)]">
    <div className="mb-3 text-center min-[380px]:mb-4">
      <h3 className="text-base font-semibold text-foreground">Evolução diária</h3>
      <p className="mt-1 text-[13px] text-muted-foreground min-[380px]:text-sm">Ao rolar, a linha mostra saldo acumulado até o fim do mês.</p>
    </div>
    <ForecastTrendChart data={detail.linePoints} />
  </div>
);

const InsightCard = ({ detail }: { detail: ForecastDetailDashboardData }) => (
  <div className="rounded-[28px] border border-border bg-card px-1.5 py-4 text-sm leading-6 text-muted-foreground min-[380px]:px-5 dark:border-[#263731] dark:bg-[#1B2823]">
    <p className={detail.insightType === 'warning' ? 'text-warning' : 'text-muted-foreground'}>{detail.insightMessage}</p>
    <div className="mt-5 grid grid-cols-3 items-stretch gap-1.5 min-[380px]:gap-2.5 min-[420px]:gap-3">
      <BalanceSummaryCard eyebrow="Agora" title="Saldo atual" value={detail.currentBalance} compact />
      <BalanceSummaryCard eyebrow="Projeção" title="Saldo projetado" value={detail.projectedBalance} compact />
      <BalanceSummaryCard
        eyebrow="Período"
        title="Janela analisada"
        value={detail.projectedIncome - detail.projectedExpense}
        compact
      />
    </div>
  </div>
);

export default ForecastDetailDashboard;
