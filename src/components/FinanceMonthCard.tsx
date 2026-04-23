import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Category, Transaction } from '@/types/finance';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FinanceMonthCardProps {
  transactions: Transaction[];
  categories: Category[];
  caixaInicial: number;
  onOpenGeneric: () => void;
}

interface SummaryRowProps {
  label: string;
  value: string;
  tone: 'neutral' | 'income' | 'expense';
  transactions?: Transaction[];
  categoryMap?: Map<string, Category>;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const toneIcon = {
  neutral: null,
  income: ArrowUpRight,
  expense: ArrowDownLeft,
} as const;

const toneBadge = {
  neutral: 'bg-slate-100 text-slate-500 dark:bg-[#1A2820] dark:text-[#94A39B]',
  income: 'bg-emerald-50 text-emerald-600 dark:bg-[#ABBC82]/15 dark:text-[#ABBC82]',
  expense: 'bg-rose-50 text-rose-600 dark:bg-[#FF6B6B]/15 dark:text-[#FF6B6B]',
} as const;

const FinanceMonthCard = ({
  transactions,
  categories,
  caixaInicial,
  onOpenGeneric,
}: FinanceMonthCardProps) => {
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const monthIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const monthExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const saldoFinal = caixaInicial + monthIncome - monthExpense;

  const incomeTransactions = useMemo(
    () =>
      [...transactions]
        .filter((transaction) => transaction.type === 'income')
        .sort(
          (first, second) =>
            new Date(`${second.date}T00:00:00`).getTime() - new Date(`${first.date}T00:00:00`).getTime(),
        ),
    [transactions],
  );

  const expenseTransactions = useMemo(
    () =>
      [...transactions]
        .filter((transaction) => transaction.type === 'expense')
        .sort(
          (first, second) =>
            new Date(`${second.date}T00:00:00`).getTime() - new Date(`${first.date}T00:00:00`).getTime(),
        ),
    [transactions],
  );

  void onOpenGeneric;

  return (
    <section className="px-4 pt-1">
      <div className="rounded-[28px] border border-[#D6E1CC] bg-[linear-gradient(180deg,#F1F5E9,#E8EEDB)] px-5 py-5 shadow-[0_18px_36px_rgba(92,134,109,0.08)] dark:border-[#233027] dark:bg-[linear-gradient(180deg,#152018,#111A14)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
        <div className="mb-5 text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9B7A4B] dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
            Resumo financeiro
          </p>
        </div>

        <div className="mb-4">
          <SummaryRow label="Caixa inicial" value={formatCurrency(caixaInicial)} tone="neutral" />
          <div className="mt-2 text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9B7A4B] dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
              Real
            </p>
            <p className="mt-1 text-[1.05rem] font-semibold tracking-[-0.02em] text-[#314238] dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
              Transações efetuadas até hoje
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <SummaryRow
            label="Entradas"
            value={formatCurrency(monthIncome)}
            tone="income"
            transactions={incomeTransactions}
            categoryMap={categoryMap}
          />
          <SummaryRow
            label="Saída"
            value={formatCurrency(monthExpense)}
            tone="expense"
            transactions={expenseTransactions}
            categoryMap={categoryMap}
          />
        </div>

        <div className="mt-5 rounded-3xl border border-[#D6E1CC] bg-[#EEF3E6] px-4 py-4 shadow-[0_14px_30px_rgba(92,134,109,0.08),inset_0_1px_0_rgba(255,255,255,0.56)] dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-[1.02rem] font-semibold tracking-[-0.02em] text-[#314238] dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
                Saldo atual
              </span>
            </div>
            <span
              className={`shrink-0 text-[1.55rem] font-bold leading-none tracking-[-0.04em] ${
                saldoFinal >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'
              }`}
            >
              {formatCurrency(saldoFinal)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

const SummaryRow = ({ label, value, tone, transactions = [], categoryMap = new Map() }: SummaryRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteTransaction = useDeleteTransaction();
  const ToneIcon = toneIcon[tone];
  const hasTransactions = transactions.length > 0;
  const shouldScroll = transactions.length > 2;
  const emptyMessage =
    tone === 'income' ? 'Nenhuma transação de entrada neste mês.' : 'Nenhuma transação de saída neste mês.';

  const handleDelete = () => {
    if (!deleteId) return;

    deleteTransaction.mutate(deleteId, {
      onSuccess: () => toast.success('Transação excluída'),
      onError: () => toast.error('Erro ao excluir transação'),
    });

    setDeleteId(null);
  };

  if (tone === 'neutral') {
    return (
      <div className="bg-transparent px-4 py-4 dark:bg-transparent">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#FCFDF9,#F5F9EE)] text-[0.84rem] font-bold uppercase tracking-[0.14em] text-[#7D9270] shadow-[0_10px_22px_rgba(92,134,109,0.10),inset_0_1px_0_rgba(255,255,255,0.88)] dark:bg-[#273A33] dark:text-[#B8CBC3] dark:shadow-none">
              CX
            </span>
            <span translate="no" className="min-w-0 flex-1 break-words font-medium text-[#314238] dark:text-[#E7F1EC]">
              {label}
            </span>
          </div>

          <span className="shrink-0 text-right font-semibold tracking-[-0.01em] text-[#314238] dark:text-[#F0F7F3]">{value}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Collapsible
        open={expanded}
        onOpenChange={setExpanded}
        className="relative rounded-3xl border border-[#D6E1CC] bg-[linear-gradient(180deg,#FCFDF9,#F7FAF1)] text-[0.96rem] shadow-[0_12px_24px_rgba(92,134,109,0.08),0_2px_6px_rgba(31,42,35,0.03),inset_0_1px_0_rgba(255,255,255,0.88)] transition-all duration-200 hover:-translate-y-1 hover:bg-[linear-gradient(180deg,#FFFFFF,#F8FAF3)] hover:shadow-[0_16px_30px_rgba(92,134,109,0.14),0_3px_8px_rgba(31,42,35,0.05),inset_0_1px_0_rgba(255,255,255,0.92)] dark:border-[#3B544C] dark:bg-[linear-gradient(180deg,#1A2823,#111A17)] dark:shadow-[0_16px_30px_rgba(3,10,8,0.28)] dark:hover:-translate-y-1 dark:hover:bg-[linear-gradient(180deg,#203029,#15201C)]"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {ToneIcon ? (
                <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneBadge[tone]}`}>
                  <ToneIcon className="h-4 w-4" />
                </span>
              ) : (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:bg-[#1A2820] dark:text-[#94A39B]">
                  CX
                </span>
              )}
              <span translate="no" className="min-w-0 flex-1 break-words font-medium text-[#314238] [text-shadow:0_1px_0_rgba(255,255,255,0.28)] dark:text-[#E6F2EE] dark:[text-shadow:none]">
                {label}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="text-right font-semibold tracking-[-0.01em] text-[#314238] [text-shadow:0_1px_0_rgba(255,255,255,0.24)] dark:text-[#F3FBF7] dark:[text-shadow:none]">{value}</span>
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

        <CollapsibleContent
          className="disclosure-content data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
          id={`finance-month-${tone}-content`}
        >
          <div className="disclosure-panel px-3 pb-3">
            <div className="rounded-[24px] bg-[#EEF3E6] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-[#1A2820] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              {hasTransactions ? (
                <div
                  className={`px-3 py-3 overflow-x-hidden bg-[#EEF3E6] rounded-xl mx-1 mb-2 dark:bg-[#0F1612] ${
                    shouldScroll ? 'themed-scrollbar max-h-[13.5rem] overflow-y-auto' : 'overflow-y-visible'
                  }`}
                >
                  <ul className="space-y-0">
                    {transactions.map((transaction, index) => {
                      const category = categoryMap.get(transaction.category_id || '');
                      const isIncome = transaction.type === 'income';

                      return (
                        <li key={transaction.id} className="group">
                          <div className="rounded-[18px] px-4 py-4 transition-colors hover:bg-[rgba(255,255,255,0.78)] focus-within:bg-[rgba(255,255,255,0.78)] dark:hover:bg-white/[0.02] dark:focus-within:bg-white/[0.02]">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="truncate text-sm font-semibold text-[#314238] dark:text-[#F1F8F4]">
                                    {transaction.description || category?.name || 'Sem descrição'}
                                  </span>
                                  <span className="shrink-0 text-xs text-slate-500 dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
                                    {formatDate(transaction.date)}
                                  </span>
                                </div>
                                {category ? (
                                  <p className="mt-1 text-[11px] text-slate-500 dark:text-[#6f827b]">{category.name}</p>
                                ) : null}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span
                                  className={`shrink-0 text-sm font-semibold ${
                                    isIncome ? 'text-[hsl(var(--success))] dark:text-[#4CD38A]' : 'text-[hsl(var(--destructive))]'
                                  }`}
                                >
                                  {isIncome ? '+' : ''}
                                  {formatCurrency(Number(transaction.amount))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setDeleteId(transaction.id)}
                                  className="rounded-md p-1 text-slate-400 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 group-hover:opacity-100 group-focus-within:opacity-100 dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)] dark:hover:bg-[#3A2A24]"
                                  aria-label="Excluir transação"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FinanceMonthCard;
