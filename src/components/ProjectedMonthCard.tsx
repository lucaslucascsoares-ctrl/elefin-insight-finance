import { ComponentType, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronDown, Trash2 } from 'lucide-react';
import { MonthlyProjectionItem } from '@/types/finance';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import BalanceSummaryCard from '@/components/BalanceSummaryCard';
import { generateProjectedInsight } from '@/lib/dashboardData';
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

interface ProjectedMonthCardProps {
  items: MonthlyProjectionItem[];
  onDeleteTemplate?: (templateId: string) => Promise<void> | void;
}

interface SummaryRowProps {
  icon: ComponentType<{ className: string }>;
  label: string;
  value: string;
  items: MonthlyProjectionItem[];
  tone: 'income' | 'expense';
  onDeleteTemplate?: (templateId: string) => Promise<void> | void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const toneBadge = {
  income: 'bg-emerald-50 text-emerald-600 dark:bg-[#ABBC82]/15 dark:text-[#ABBC82]',
  expense: 'bg-rose-50 text-rose-600 dark:bg-[#FF6B6B]/15 dark:text-[#FF6B6B]',
} as const;

const ProjectedMonthCard = ({ items, onDeleteTemplate }: ProjectedMonthCardProps) => {
  const activeItems = items.filter((item) => item.status !== 'ignored' && item.status !== 'paid');
  const totalIncome = activeItems
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = activeItems
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const projectedInsight = useMemo(() => generateProjectedInsight(items), [items]);

  const incomeItems = useMemo(() => activeItems.filter((item) => item.type === 'income'), [activeItems]);
  const expenseItems = useMemo(() => activeItems.filter((item) => item.type === 'expense'), [activeItems]);

  return (
    <section className="px-4 pt-1">
      <div className="rounded-[28px] border border-[#D6E1CC] bg-[linear-gradient(180deg,#F1F5E9,#E8EEDB)] px-5 py-5 shadow-[0_18px_36px_rgba(92,134,109,0.08)] dark:border-[#233027] dark:bg-[linear-gradient(180deg,#152018,#111A14)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
        <div className="mb-5 flex items-center justify-center">
          <div className="notranslate text-center" translate="no">
            <p
              className="notranslate text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9B7A4B] dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]"
              translate="no"
            >
              Planejamento
            </p>
            <h2
              className="notranslate mt-1 min-w-0 break-words text-center text-[1.05rem] font-semibold tracking-[-0.02em] text-[#314238] dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]"
              translate="no"
            >
              Contas projetadas do mês
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          <SummaryRow
            icon={ArrowUpRight}
            label="Entrada"
            value={formatCurrency(totalIncome)}
            items={incomeItems}
            tone="income"
            onDeleteTemplate={onDeleteTemplate}
          />
          <SummaryRow
            icon={ArrowDownLeft}
            label="Saída"
            value={formatCurrency(totalExpense)}
            items={expenseItems}
            tone="expense"
            onDeleteTemplate={onDeleteTemplate}
          />
        </div>

        <div className="mt-3">
          <BalanceSummaryCard eyebrow="Saldo" title="Saldo planejado" value={totalIncome - totalExpense} />
        </div>

        <div className="mt-3 rounded-3xl border border-[#D6E1CC] bg-[#EEF3E6] px-4 py-4 shadow-[0_14px_30px_rgba(92,134,109,0.08),inset_0_1px_0_rgba(255,255,255,0.56)] dark:border-[#233027] dark:bg-[#111A14] dark:shadow-[0_4px_12px_rgba(0,0,0,0.40)]">
          <p className="text-sm leading-6 text-amber-500 dark:text-[#DDBB8A]">{projectedInsight.message}</p>
        </div>
      </div>
    </section>
  );
};

const SummaryRow = ({ icon: Icon, label, value, items = [], tone, onDeleteTemplate }: SummaryRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const hasItems = items.length > 0;
  const shouldScroll = items.length > 2;

  const handleDelete = async () => {
    if (!deleteTemplateId || !onDeleteTemplate) return;
    await onDeleteTemplate(deleteTemplateId);
    setDeleteTemplateId(null);
  };

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
              <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneBadge[tone]}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 break-words font-medium text-[#314238] [text-shadow:0_1px_0_rgba(255,255,255,0.28)] dark:text-[#E6F2EE] dark:[text-shadow:none]">{label}</span>
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
              {hasItems ? (
                <div
                  className={`px-3 py-3 overflow-x-hidden bg-[#EEF3E6] rounded-xl mx-1 mb-2 dark:bg-[#0F1612] ${
                    shouldScroll ? 'themed-scrollbar max-h-[13.5rem] overflow-y-auto' : 'overflow-y-visible'
                  }`}
                >
                  <ul className="space-y-0">
                    {items.map((item, index) => {
                      const isIncome = item.type === 'income';

                      return (
                        <li key={item.id} className="group">
                          <div className="px-2 py-3 transition-colors hover:bg-slate-50 focus-within:bg-slate-50 dark:hover:bg-white/[0.02] dark:focus-within:bg-white/[0.02]">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="truncate text-sm font-semibold text-[#314238] dark:text-[#F1F8F4]">
                                    {item.title}
                                  </span>
                                  <span className="shrink-0 text-xs text-slate-500 dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
                                    {item.account_name}
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#6f827b]">
                                  {item.category_name || 'Sem categoria'}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span
                                  className={`shrink-0 text-sm font-semibold ${
                                    isIncome ? 'text-[hsl(var(--success))] dark:text-[#4CD38A]' : 'text-[hsl(var(--destructive))]'
                                  }`}
                                >
                                  {isIncome ? '+' : ''}
                                  {formatCurrency(Number(item.amount))}
                                </span>
                                {onDeleteTemplate ? (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTemplateId(item.template_id)}
                                    className="rounded-md p-1 text-slate-400 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 group-hover:opacity-100 group-focus-within:opacity-100 dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)] dark:hover:bg-[#3A2A24]"
                                    aria-label="Excluir projeção"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          {index < items.length - 1 ? <Separator className="bg-slate-200/70 dark:bg-white/10" /> : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="mx-1 mb-2 rounded-xl bg-[#EEF3E6] px-4 py-8 dark:bg-[#0F1612]">
                  <p className="text-center text-sm text-slate-500 dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
                    {tone === 'income' ? 'Nenhuma entrada prevista neste mês.' : 'Nenhuma saída prevista neste mês.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeção</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleDelete();
              }}
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

export default ProjectedMonthCard;
