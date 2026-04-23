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
    <div className="space-y-5 px-1 pb-1 pt-2">
      <HeaderCard detail={detail} />
      <PieCard detail={detail} />
      <TrendCard detail={detail} />
      <InsightCard detail={detail} />
    </div>
  );
};

const HeaderCard = ({ detail }: { detail: ForecastDetailDashboardData }) => (
  <div className="rounded-[28px] border border-border bg-card px-5 py-5 text-card-foreground shadow-[0_18px_38px_rgba(15,23,42,0.10)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.28)]">
    <div className="text-center">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Previsão detalhada</p>
      <h2 className="mt-1 text-lg font-semibold text-foreground">
        {detail.windowStartLabel} até {detail.windowEndLabel}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        A leitura é recalculada ao abrir o painel, usando a data local como ponto de partida.
      </p>
    </div>
  </div>
);

const PieCard = ({ detail }: { detail: ForecastDetailDashboardData }) => (
  <div className="rounded-[28px] border border-border bg-card px-5 py-5 text-card-foreground shadow-[0_18px_38px_rgba(15,23,42,0.10)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.28)]">
    <div className="mb-4 lg:pl-[168px] lg:text-center">
      <h3 className="text-[1.2rem] font-bold tracking-[-0.02em] text-[#314238] dark:text-[#E6F2EE]">
        Composição da previsão
      </h3>
    </div>
    <ForecastPieChart slices={detail.pieSlices} />
  </div>
);

const TrendCard = ({ detail }: { detail: ForecastDetailDashboardData }) => (
  <div className="rounded-[28px] border border-border bg-card px-5 py-5 text-card-foreground shadow-[0_18px_38px_rgba(15,23,42,0.10)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.28)]">
    <div className="mb-4 text-center">
      <h3 className="text-base font-semibold text-foreground">Evolução diária</h3>
      <p className="mt-1 text-sm text-muted-foreground">Ao rolar, a linha mostra saldo acumulado até o fim do mês.</p>
    </div>
    <ForecastTrendChart data={detail.linePoints} />
  </div>
);

const InsightCard = ({ detail }: { detail: ForecastDetailDashboardData }) => (
  <div className="rounded-[28px] border border-border bg-card px-5 py-4 text-sm leading-6 text-muted-foreground dark:border-[#263731] dark:bg-[#1B2823]">
    <p className={detail.insightType === 'warning' ? 'text-warning' : 'text-muted-foreground'}>{detail.insightMessage}</p>
    <div className="mt-4 grid grid-cols-3 items-stretch gap-3">
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
