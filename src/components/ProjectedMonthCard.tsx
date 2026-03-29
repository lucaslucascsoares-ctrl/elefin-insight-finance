import { ComponentType } from 'react';
import { BellRing, CalendarClock, ClipboardList } from 'lucide-react';
import { MonthlyProjectionItem } from '@/types/finance';

interface ProjectedMonthCardProps {
  items: MonthlyProjectionItem[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ProjectedMonthCard = ({ items }: ProjectedMonthCardProps) => {
  const activeItems = items.filter((item) => item.status !== 'ignored' && item.status !== 'paid');
  const totalProjected = activeItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const reminderCount = activeItems.filter((item) => item.reminder_enabled).length;
  const nextDueDay = activeItems
    .map((item) => item.due_day)
    .filter((value): value is number => Boolean(value))
    .sort((first, second) => first - second)[0];

  return (
    <section className="px-4 pt-1">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] px-5 py-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.36)]">
        <div className="mb-5 flex items-center justify-center">
          <div className="notranslate text-center" translate="no">
            <p className="notranslate text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-[#8EA39B]" translate="no">
              Planejamento
            </p>
            <h2
              className="notranslate mt-1 min-w-0 break-words text-center text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground"
              translate="no"
            >
              Contas projetadas do mes
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          <SummaryRow icon={ClipboardList} label="Total previsto" value={formatCurrency(totalProjected)} />
          <SummaryRow
            icon={CalendarClock}
            label="Contas pendentes"
            value={`${activeItems.length} conta${activeItems.length === 1 ? '' : 's'}`}
          />
          <SummaryRow
            icon={BellRing}
            label="Lembretes ativos"
            value={
              nextDueDay
                ? `${reminderCount} ativo${reminderCount === 1 ? '' : 's'} - proximo dia ${nextDueDay}`
                : `${reminderCount} ativo${reminderCount === 1 ? '' : 's'}`
            }
          />
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white/75 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-[#263731] dark:bg-[#1B2823] dark:shadow-none">
          <p className="text-sm leading-6 text-muted-foreground dark:text-[#B8CBC3]">
            Esta visao mostra apenas planejamento. As contas continuam previstas e so entram no
            financeiro real quando voce marcar como pagas.
          </p>
        </div>
      </div>
    </section>
  );
};

interface SummaryRowProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const SummaryRow = ({ icon: Icon, label, value }: SummaryRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/70 px-4 py-4 text-[0.96rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-[#263731] dark:bg-[#1B2823] dark:shadow-none">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-[#21453C] dark:text-[#D5E7E0]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 break-words font-medium text-slate-600 dark:text-[#E6F2EE]">{label}</span>
      </div>
      <span className="shrink-0 text-right text-sm font-semibold tracking-[-0.01em] text-foreground">{value}</span>
    </div>
  );
};

export default ProjectedMonthCard;
