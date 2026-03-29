import { useMemo, useState } from 'react';
import { BellRing, CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import MonthlyProjectionItemDrawer from '@/components/projection/MonthlyProjectionItemDrawer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Category, GROUP_LABELS, GroupType, MonthlyProjectionItem, ProjectionTemplate } from '@/types/finance';

interface ProjectionMonthlySectionProps {
  items: MonthlyProjectionItem[];
  templates: ProjectionTemplate[];
  categories: Category[];
  selectedDate: Date;
  onSaveMonthEdit: (item: MonthlyProjectionItem, title: string, amount: number) => Promise<void>;
  onIgnoreMonth: (item: MonthlyProjectionItem) => Promise<void>;
  onRestoreMonth: (item: MonthlyProjectionItem) => Promise<void>;
  onMarkPaid: (item: MonthlyProjectionItem, transactionId: string) => Promise<void>;
}

const statusClasses: Record<MonthlyProjectionItem['status'], string> = {
  predicted: 'bg-slate-100 text-slate-700 dark:bg-[#1B2823] dark:text-[#B8CBC3]',
  edited: 'bg-blue-100 text-blue-700 dark:bg-[#21453C] dark:text-[#E6F2EE]',
  ignored: 'bg-amber-100 text-amber-700 dark:bg-[#3A2E1B] dark:text-[#D7C4A1]',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-[#21453C] dark:text-[#9FD5C2]',
};

const statusLabels: Record<MonthlyProjectionItem['status'], string> = {
  predicted: 'Prevista',
  edited: 'Editada',
  ignored: 'Ignorada',
  paid: 'Paga',
};

const ProjectionMonthlySection = ({
  items,
  templates,
  categories,
  selectedDate,
  onSaveMonthEdit,
  onIgnoreMonth,
  onRestoreMonth,
  onMarkPaid,
}: ProjectionMonthlySectionProps) => {
  const [selectedItem, setSelectedItem] = useState<MonthlyProjectionItem | null>(null);
  const [expanded, setExpanded] = useState(false);

  const groupedItems = useMemo(() => {
    const groups: Record<GroupType, MonthlyProjectionItem[]> = {
      essenciais: [],
      desejos: [],
      prioridades: [],
    };

    items.forEach((item) => {
      groups[item.group_type].push(item);
    });

    return groups;
  }, [items]);

  const totalProjected = items
    .filter((item) => item.status !== 'ignored')
    .reduce((sum, item) => sum + item.amount, 0);

  const templateMap = useMemo(() => new Map(templates.map((template) => [template.id, template])), [templates]);

  return (
    <>
      <section className="mt-4 px-4" id="projection-section">
        <Collapsible
          open={expanded}
          onOpenChange={setExpanded}
          className="rounded-[28px] border border-border/70 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_36px_rgba(3,10,8,0.34)]"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="projection-monthly-content"
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-foreground">Contas projetadas do mês</h2>
                <p className="mt-1 break-words text-sm text-muted-foreground">
                  Toque para ver suas contas fixas previstas.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground dark:bg-[#1B2823] dark:text-[#B8CBC3]">
                  {items.length} contas
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background dark:border-[#263731] dark:bg-[#1B2823]">
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                      expanded ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </span>
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent
            id="projection-monthly-content"
            className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
          >
            <div className="mt-4 space-y-4 border-t border-border/70 pt-4">
              <div className="rounded-2xl bg-muted/30 px-4 py-4 text-sm leading-6 text-muted-foreground dark:bg-[#1B2823] dark:text-[#B8CBC3]">
                Essas são as contas fixas vindas da sua Projeção de Gastos. Elas aparecem automaticamente no mês, mas
                só entram como gasto real quando você as marcar como pagas.
              </div>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground dark:border-[#2F6F5E]/45 dark:bg-[#111A17] dark:text-[#8EA39B]">
                  Nenhuma conta fixa cadastrada ainda. Use a aba Projeção de Gastos para criar sua base mensal.
                </div>
              ) : (
                <div className="space-y-4">
                  {(Object.keys(groupedItems) as GroupType[]).map((groupType) => {
                    const groupItems = groupedItems[groupType];
                    if (groupItems.length === 0) return null;

                    return (
                      <div key={groupType} className="rounded-2xl border border-border/70 dark:border-[#263731] dark:bg-[#16211D]">
                        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 dark:border-[#263731]">
                          <span className="min-w-0 break-words text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {GROUP_LABELS[groupType]}
                          </span>
                          <span className="shrink-0 text-sm font-medium text-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                              groupItems
                                .filter((item) => item.status !== 'ignored')
                                .reduce((sum, item) => sum + item.amount, 0),
                            )}
                          </span>
                        </div>

                        <div className="divide-y divide-border/70 dark:divide-[#263731]">
                          {groupItems.map((item) => {
                            const categoryName =
                              item.category_name ??
                              categories.find((category) => category.id === item.category_id)?.name ??
                              'Sem categoria';

                            return (
                              <button
                                key={item.id}
                                type="button"
                                data-testid={`projected-item-${item.template_id}`}
                                aria-label={`Abrir conta projetada ${item.title}`}
                                onClick={() => setSelectedItem(item)}
                                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 dark:hover:bg-[#1B2823]"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="break-words text-sm font-semibold text-foreground">{item.title}</span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses[item.status]}`}
                                    >
                                      {statusLabels[item.status]}
                                    </span>
                                  </div>
                                  <p className="mt-1 break-words text-xs text-muted-foreground">{categoryName}</p>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                    {item.due_day ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 dark:bg-[#1B2823] dark:text-[#B8CBC3]">
                                        <CalendarDays className="h-3 w-3" />
                                        Dia {item.due_day}
                                      </span>
                                    ) : null}
                                    {item.reminder_enabled ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700 dark:bg-[#21453C] dark:text-[#9FD5C2]">
                                        <BellRing className="h-3 w-3" />
                                        Lembrete ativo
                                      </span>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-white dark:border dark:border-[#2F6F5E]/30 dark:bg-[linear-gradient(180deg,#21453C,#16211D)]">
                    <span className="text-sm font-medium text-white/80 dark:text-[#B8CBC3]">Total previsto ativo</span>
                    <span className="shrink-0 text-xl font-semibold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProjected)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <MonthlyProjectionItemDrawer
        open={Boolean(selectedItem)}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        item={selectedItem}
        template={selectedItem ? templateMap.get(selectedItem.template_id) ?? null : null}
        categories={categories}
        selectedDate={selectedDate}
        onSaveMonthEdit={onSaveMonthEdit}
        onIgnoreMonth={onIgnoreMonth}
        onRestoreMonth={onRestoreMonth}
        onMarkPaid={onMarkPaid}
      />
    </>
  );
};

export default ProjectionMonthlySection;
