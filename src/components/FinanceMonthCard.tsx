import { Check } from 'lucide-react';
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
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const saldoFinal = caixaInicial + monthIncome - monthExpense;

  return (
    <section className="px-4 pt-2">
      <div className="rounded-[26px] border border-border bg-card px-5 py-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="min-w-0 flex-1 break-words text-[15px] font-semibold text-foreground">Caixa do mês</h2>
          <button
            type="button"
            className="shrink-0 text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Ver contas &#8250;
          </button>
        </div>

        <div className="space-y-5">
          <SummaryRow label="Caixa inicial" value={formatCurrency(caixaInicial)} />
          <SummaryRow
            label="Entradas"
            value={formatCurrency(monthIncome)}
            actionLabel="Adicionar entrada"
            onAction={onOpenIncome}
          />
          <SummaryRow
            label="Saída"
            value={`- ${formatCurrency(monthExpense)}`}
            actionLabel="Adicionar saída"
            onAction={onOpenExpense}
          />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[16px] font-semibold text-foreground">Saldo atual</span>
            <span
              className={`shrink-0 text-[16px] font-bold ${
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
        onClick={onOpenGeneric}
        className="mt-4 flex h-16 w-full items-center justify-center rounded-[20px] bg-slate-800 px-6 text-center text-[18px] font-bold text-white transition-transform hover:scale-[0.99]"
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
}

const SummaryRow = ({ label, value, actionLabel, onAction }: SummaryRowProps) => (
  <div className="flex items-center justify-between gap-4 text-[15px] text-slate-500">
    <span className="min-w-0 flex-1 break-words">{label}</span>
    <div className="flex shrink-0 items-center gap-3">
      <span className="text-right">{value}</span>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
          className="inline-flex items-center justify-center text-primary transition-transform hover:scale-110"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);

export default FinanceMonthCard;
