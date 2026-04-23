import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface FlowSummaryItem {
  id: string;
  title: string;
  amount: number;
  subtitle: string;
  badge: string;
}

export interface FlowSummarySection {
  label: string;
  value: number;
  items: FlowSummaryItem[];
  tone: 'income' | 'expense';
  emptyMessage: string;
}

interface FlowSummaryCardProps {
  eyebrow: string;
  title: string;
  description: string;
  footer: string;
  sections: FlowSummarySection[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const sectionToneClass = {
  income: 'bg-emerald-50 text-emerald-600 dark:bg-[#DDF6EC] dark:text-[#3F8C74]',
  expense: 'bg-rose-50 text-rose-600 dark:bg-[#FAE7E8] dark:text-[#CC6C7A]',
} as const;

const sectionIcon = {
  income: ArrowUpRight,
  expense: ArrowDownLeft,
} as const;

const FlowSummaryCard = ({ eyebrow, title, description, footer, sections }: FlowSummaryCardProps) => {
  return (
    <section className="px-3 pt-1 min-[380px]:px-4">
      <div className="min-w-0 overflow-hidden rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] px-4 py-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] min-[380px]:px-5 dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.36)]">
        <div className="mb-5 flex items-center justify-center">
          <div className="notranslate text-center" translate="no">
            <p className="notranslate text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-[#8EA39B]" translate="no">
              {eyebrow}
            </p>
            <h2
              className="notranslate mt-1 min-w-0 text-center text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground [overflow-wrap:normal]"
              translate="no"
            >
              {title}
            </h2>
          </div>
        </div>

        {description ? (
          <div className="mb-4 rounded-[24px] border border-[#2b4138] bg-[#17231d] px-4 py-4 text-sm leading-6 text-[#b8cbc3] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {description}
          </div>
        ) : null}

        <div className="space-y-3">
          {sections.map((section) => (
            <FlowSectionRow key={section.label} section={section} />
          ))}
        </div>

        {footer ? (
          <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white/75 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-[#263731] dark:bg-[#1B2823] dark:shadow-none">
            <p className="text-sm leading-6 text-muted-foreground dark:text-[#B8CBC3]">{footer}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};

const FlowSectionRow = ({ section }: { section: FlowSummarySection }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = sectionIcon[section.tone];
  const hasItems = section.items.length > 0;

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className="rounded-3xl border border-slate-200/80 bg-white/70 text-[0.96rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-[#263731] dark:bg-[#1B2823] dark:shadow-none"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${sectionToneClass[section.tone]}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 font-medium text-slate-600 [overflow-wrap:normal] dark:text-[#E6F2EE]">{section.label}</span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="text-right text-sm font-semibold tracking-[-0.01em] text-foreground">
              {formatCurrency(section.value)}
            </span>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-label={`Abrir ${section.label.toLowerCase()}`}
                aria-expanded={expanded}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-[0_10px_18px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-[1px] hover:text-slate-700 dark:border-[#314740] dark:bg-[#263731] dark:text-[#D9E9E3] dark:shadow-none dark:hover:bg-[#314740] dark:hover:text-[#F3FBF7]"
              >
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="border-t border-slate-200/80 px-4 pb-4 pt-2 dark:border-[#263731]">
          <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/60 dark:border-[#2F6F5E]/45 dark:bg-[#111A17]">
            {hasItems ? (
              <ScrollArea className="max-h-72">
                <div className="px-2 py-2">
                  <ul className="space-y-1">
                    {section.items.map((item, index) => (
                      <li key={item.id}>
                        <div className="rounded-2xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-[#1B2823]">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-slate-900 dark:text-[#F1F8F4]">{item.title}</span>
                                {item.badge ? (
                                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-[#263731] dark:text-[#B8CBC3]">
                                    {item.badge}
                                  </span>
                                ) : null}
                              </div>
                              {item.subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-[#8EA39B]">{item.subtitle}</p> : null}
                            </div>
                            <span
                              className={`shrink-0 text-sm font-semibold ${
                                section.tone === 'income' ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'
                              }`}
                            >
                              {section.tone === 'income' ? '+' : ''}
                              {formatCurrency(Number(item.amount))}
                            </span>
                          </div>
                        </div>
                        {index < section.items.length - 1 ? (
                          <Separator className="mt-1 bg-slate-200/70 dark:bg-[#263731]" />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollArea>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-[#8EA39B]">{section.emptyMessage}</p>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FlowSummaryCard;
