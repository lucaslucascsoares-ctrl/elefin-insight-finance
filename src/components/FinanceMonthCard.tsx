import { ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import { Transaction } from '@/types/finance';

interface FinanceMonthCardProps {
  transactions: Transaction[];
  caixaInicial: number;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenGeneric: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const FinanceMonthCard = ({
  transactions,
  caixaInicial,
  onOpenIncome,
  onOpenExpense,
  onOpenGeneric,
}: FinanceMonthCardProps) => {
  const monthIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const monthExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const saldoFinal = caixaInicial + monthIncome - monthExpense;

  return (
    <section className="px-4 pt-1">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] px-5 py-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">Resumo financeiro</p>
            <h2 className="mt-1 min-w-0 break-words text-center text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground">
              Caixa do mês
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          <SummaryRow label="Caixa inicial" value={formatCurrency(caixaInicial)} tone="neutral" />
          <SummaryRow
            label="Entradas"
            value={formatCurrency(monthIncome)}
            actionLabel="Adicionar entrada"
            onAction={onOpenIncome}
            tone="income"
          />
          <SummaryRow
            label="Saída"
            value={`- ${formatCurrency(monthExpense)}`}
            actionLabel="Adicionar saída"
            onAction={onOpenExpense}
            tone="expense"
          />
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white/75 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Saldo</p>
              <span className="mt-1 block text-[1.02rem] font-semibold tracking-[-0.02em] text-foreground">
                Saldo atual
              </span>
            </div>
            <span
              className={`shrink-0 text-[1.55rem] font-bold tracking-[-0.04em] ${
                saldoFinal >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'
              }`}
            >
              {formatCurrency(saldoFinal)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        data-testid="new-transaction-button"
        onClick={onOpenGeneric}
        className="mt-4 flex h-16 w-full items-center justify-center rounded-[22px] bg-[linear-gradient(180deg,#23324a,#172033)] px-6 text-center text-[1rem] font-semibold tracking-[-0.02em] text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-[1px]"
      >
        + Nova Movimentação
      </button>
    </section>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
  actionLabel?: string;
  onAction?: () => void;
  tone: 'neutral' | 'income' | 'expense';
}

const toneIcon = {
  neutral: null,
  income: ArrowUpRight,
  expense: ArrowDownLeft,
} as const;

const toneBadge = {
  neutral: 'bg-slate-100 text-slate-500',
  income: 'bg-emerald-50 text-emerald-600',
  expense: 'bg-rose-50 text-rose-600',
} as const;

const SummaryRow = ({ label, value, actionLabel, onAction, tone }: SummaryRowProps) => {
  const ToneIcon = toneIcon[tone];

  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/70 px-4 py-4 text-[0.96rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="flex min-w-0 items-center gap-3">
        {ToneIcon ? (
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneBadge[tone]}`}>
            <ToneIcon className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
            CX
          </span>
        )}
        <span translate="no" className="min-w-0 flex-1 break-words font-medium text-slate-600">
          {label}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-right font-semibold tracking-[-0.01em] text-foreground">{value}</span>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            aria-label={actionLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-[0_10px_18px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-[1px] hover:text-slate-700"
          >
            <Check className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default FinanceMonthCard;
