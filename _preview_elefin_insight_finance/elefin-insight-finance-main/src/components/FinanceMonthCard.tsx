import { Check } from 'lucide-react';
import { Transaction } from '@/types/finance';

interface FinanceMonthCardProps {
  transactions: Transaction[];
  month: number;
  year: number;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenGeneric: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const isBeforeMonth = (date: Date, month: number, year: number) =>
  date.getFullYear() < year || (date.getFullYear() === year && date.getMonth() < month);

const FinanceMonthCard = ({
  transactions,
  month,
  year,
  onOpenIncome,
  onOpenExpense,
  onOpenGeneric,
}: FinanceMonthCardProps) => {
  const previousBalance = transactions.reduce((sum, transaction) => {
    const date = new Date(`${transaction.date}T00:00:00`);
    if (Number.isNaN(date.getTime())) return sum;
    if (!isBeforeMonth(date, month, year)) return sum;
    return sum + Number(transaction.amount) * (transaction.type === 'income' ? 1 : -1);
  }, 0);

  const monthIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const monthExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const balance = previousBalance + monthIncome - monthExpense;

  return (
    <section className="px-4 pt-2">
      <div className="rounded-[26px] border border-border bg-card px-5 py-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-foreground">Caixa do mes</h2>
          <button type="button" className="text-sm font-medium text-primary transition-opacity hover:opacity-80">
            Ver contas &#8250;
          </button>
        </div>

        <div className="space-y-5">
          <SummaryRow label="Caixa inicial" value={formatCurrency(previousBalance)} />
          <SummaryRow
            label="Entradas"
            value={formatCurrency(monthIncome)}
            actionLabel="Adicionar entrada"
            onAction={onOpenIncome}
          />
          <SummaryRow
            label="Saida"
            value={`- ${formatCurrency(monthExpense)}`}
            actionLabel="Adicionar saida"
            onAction={onOpenExpense}
          />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-semibold text-foreground">Saldo atual</span>
            <span className={`text-[16px] font-bold ${balance >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenGeneric}
        className="mt-4 flex h-16 w-full items-center justify-center rounded-[20px] bg-slate-800 px-6 text-[18px] font-bold text-white transition-transform hover:scale-[0.99]"
      >
        + Nova Movimentacao
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
    <span>{label}</span>
    <div className="flex items-center gap-3">
      <span>{value}</span>
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
