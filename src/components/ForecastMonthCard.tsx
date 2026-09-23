import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { ForecastItem, MonthlyForecastData } from '@/types/finance';
import { FORECAST_SOURCE_LABELS, generateForecastInsight } from '@/lib/forecast';
import BalanceSummaryCard from '@/components/BalanceSummaryCard';
import IdealComparisonCard from '@/components/IdealComparisonCard';

interface ForecastMonthCardProps {
  data: MonthlyForecastData | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ForecastMonthCard = ({ data }: ForecastMonthCardProps) => {
  const title = data ? `Previsão baseada em ${data.mesReferencia}` : 'Previsão baseada no mês anterior';
  const incomeItems = useMemo(() => data?.incomeItems ?? [], [data]);
  const expenseItems = useMemo(() => data?.expenseItems ?? [], [data]);
  const balance = (data?.totalEntradaPrevisto ?? 0) - (data?.totalSaidaPrevisto ?? 0);
  const forecastInsight = useMemo(() => generateForecastInsight(data), [data]);

  return (
    <section className="pt-1">
      <div className="min-w-0 rounded-[28px] border border-[#D6E1CC] bg-[linear-gradient(180deg,#F1F5E9,#E8EEDB)] px-4 py-5 shadow-[0_18px_36px_rgba(92,134,109,0.08)] min-[380px]:px-5 dark:border-[#233027] dark:bg-[linear-gradient(180deg,#152018,#111A14)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
        <div className="mb-5 flex items-center justify-center">
          <div className="notranslate text-center" translate="no">
            <p className="notranslate text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9B7A4B] dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]" translate="no">
              Previsão
            </p>
            <h2
              className="notranslate mt-1 min-w-0 text-center text-[1.05rem] font-semibold tracking-[-0.02em] text-[#314238] [overflow-wrap:normal] dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]"
              translate="no"
            >
              {title}
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          <SummaryRow
            label="Entrada"
            value={formatCurrency(data?.totalEntradaPrevisto ?? 0)}
            tone="income"
            transactions={incomeItems}
          />
          <SummaryRow
            label="Saída"
            value={formatCurrency(data?.totalSaidaPrevisto ?? 0)}
            tone="expense"
            transactions={expenseItems}
          />
        </div>

        <div className="mt-3">
          <BalanceSummaryCard eyebrow="Saldo" title="Saldo previsto" value={balance} />
        </div>

        <div className="mt-3 min-h-[108px] rounded-3xl border border-[#D6E1CC] bg-[#EEF3E6] px-4 py-4 shadow-[0_14px_30px_rgba(92,134,109,0.08),inset_0_1px_0_rgba(255,255,255,0.56)] dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
          <p
            className={`text-sm leading-6 ${
               forecastInsight.type === 'warning'
                ? 'text-amber-600 dark:text-amber-300'
                 : 'text-muted-foreground dark:text-[#B8CBC3]'
            }`}
          >
            {forecastInsight.message}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <IdealComparisonCard
          title="Previsão do mês"
          groups={data?.groups ?? { essenciais: 0, desejos: 0, prioridades: 0 }}
          footerMessage="Nenhuma conta prevista ativa neste mês."
        />
      </div>
    </section>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
  tone: 'income' | 'expense';
  transactions: ForecastItem[];
}

const toneIcon = {
  income: ArrowUpRight,
  expense: ArrowDownLeft,
} as const;

const toneBadge = {
  income: 'bg-emerald-50 text-emerald-600 dark:bg-[#ABBC82]/15 dark:text-[#ABBC82]',
  expense: 'bg-rose-50 text-rose-600 dark:bg-[#FF6B6B]/15 dark:text-[#FF6B6B]',
} as const;

const SummaryRow = ({ label, value, tone, transactions = [] }: SummaryRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const ToneIcon = toneIcon[tone];
  const hasTransactions = transactions.length > 0;
  const shouldScroll = transactions.length > 2;
  const title = tone === 'income' ? 'Previsões de entrada' : 'Previsões de saída';
  const emptyMessage = tone === 'income' ? 'Nenhuma entrada prevista neste mês.' : 'Nenhuma saída prevista neste mês.';

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className="relative rounded-3xl border border-[#D6E1CC] bg-[linear-gradient(180deg,#FCFDF9,#F7FAF1)] text-[0.96rem] shadow-[0_12px_24px_rgba(92,134,109,0.08),0_2px_6px_rgba(31,42,35,0.03),inset_0_1px_0_rgba(255,255,255,0.88)] transition-all duration-200 hover:-translate-y-1 hover:bg-[linear-gradient(180deg,#FFFFFF,#F8FAF3)] hover:shadow-[0_16px_30px_rgba(92,134,109,0.14),0_3px_8px_rgba(31,42,35,0.05),inset_0_1px_0_rgba(255,255,255,0.92)] dark:border-[#3B544C] dark:bg-[linear-gradient(180deg,#1A2823,#111A17)] dark:shadow-[0_16px_30px_rgba(3,10,8,0.28)] dark:hover:-translate-y-1 dark:hover:bg-[linear-gradient(180deg,#203029,#15201C)]"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneBadge[tone]}`}>
              <ToneIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 font-medium text-[#314238] [overflow-wrap:normal] [text-shadow:0_1px_0_rgba(255,255,255,0.28)] dark:text-[#E6F2EE] dark:[text-shadow:none]">{label}</span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="text-right text-sm font-semibold tracking-[-0.01em] text-[#314238] [text-shadow:0_1px_0_rgba(255,255,255,0.24)] dark:text-[#F3FBF7] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">{value}</span>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-label={`Abrir ${label.toLowerCase()}`}
                aria-expanded={expanded}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-[0_10px_18px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-[1px] hover:text-slate-700 dark:border-[#233027] dark:bg-[#0F1612] dark:text-[#E8EEE9] dark:shadow-[0_10px_24px_rgba(0,0,0,0.45)] dark:hover:border-[#ABBC82] dark:hover:text-[#ABBC82]"
              >
                <ChevronDown className={`disclosure-chevron h-5 w-5 ${expanded ? 'rotate-180' : 'rotate-0'}`} />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      <CollapsibleContent className="disclosure-content data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="disclosure-panel px-3 pb-3">
          <div className="rounded-b-xl bg-[#EEF3E6] dark:bg-[#1A2820]">
            {hasTransactions ? (
              <div
                className={`px-3 py-3 overflow-x-hidden bg-[#EEF3E6] rounded-xl mx-1 mb-2 dark:bg-[#0F1612] ${
                  shouldScroll ? 'themed-scrollbar max-h-[13.5rem] overflow-y-auto' : 'overflow-y-visible'
                }`}
              >
                  <ul className="space-y-0">
                    {transactions.map((transaction, index) => {
                      const isIncome = transaction.type === 'income';
                      const referenceLabel =
                        transaction.source === 'recurring'
                          ? 'Regra recorrente'
                          : transaction.source === 'history'
                            ? `Base: ${new Date(transaction.reference_year, transaction.reference_month, 1).toLocaleDateString('pt-BR', {
                                 month: 'short',
                               })}`
                             : 'Ajuste manual';

                      return (
                        <li key={transaction.id}>
                          <div className="px-2 py-3 transition-colors hover:bg-slate-50 focus-within:bg-slate-50 dark:hover:bg-white/[0.02] dark:focus-within:bg-white/[0.02]">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="truncate text-sm font-semibold text-[#314238] dark:text-[#F1F8F4]">
                                    {transaction.title}
                                  </span>
                                  <span className="shrink-0 text-xs text-slate-500 dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
                                    {referenceLabel}
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#6f827b]">
                                  {FORECAST_SOURCE_LABELS[transaction.source]}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 text-sm font-semibold ${
                                  isIncome ? 'text-[hsl(var(--success))] dark:text-[#4CD38A]' : 'text-[hsl(var(--destructive))]'
                                }`}
                              >
                                {isIncome ? '+' : ''}
                                {formatCurrency(Number(transaction.amount))}
                              </span>
                            </div>
                          </div>
                          {index < transactions.length - 1 ? <Separator className="bg-slate-200/70 dark:bg-white/10" /> : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
            ) : (
              <div className="mx-1 mb-2 rounded-xl bg-[#EEF3E6] px-4 py-8 dark:bg-[#0F1612]">
                <p className="text-center text-sm text-slate-500 dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">{emptyMessage}</p>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ForecastMonthCard;
