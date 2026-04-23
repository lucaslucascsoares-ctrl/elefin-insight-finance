import { Transaction, Category, GroupType, GROUP_LABELS } from '@/types/finance';
import { normalizeGroupType } from '@/lib/groupType';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer, Cell } from 'recharts';

interface SpendingAccordionProps {
  transactions: Transaction[];
  categories: Category[];
}

const BAR_COLORS: Record<GroupType, string> = {
  essenciais: 'hsl(var(--chart-essenciais))',
  desejos: 'hsl(var(--chart-desejos))',
  prioridades: 'hsl(var(--chart-prioridades))',
};

const SpendingAccordion = ({ transactions, categories }: SpendingAccordionProps) => {
  const monthExpenses = transactions.filter(Boolean).filter((t) => t.type === 'expense');

  const categoryMap = new Map(categories.filter(Boolean).map((c) => [c.id, c]));
  const groups: Record<GroupType, number> = { essenciais: 0, desejos: 0, prioridades: 0 };

  monthExpenses.forEach((t) => {
    const cat = categoryMap.get(t.category_id || '');
    if (cat) groups[normalizeGroupType(cat?.group_type)] += Number(t.amount);
  });

  const totalExpenses = Object.values(groups).reduce((a, b) => a + b, 0);

  const data = (Object.keys(groups) as GroupType[]).map((group) => ({
    name: GROUP_LABELS[group],
    value: totalExpenses > 0 ? Math.round((groups[group] / totalExpenses) * 100) : 0,
    group,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <AccordionItem value="spending" className="border-border/50">
      <AccordionTrigger className="px-4 text-sm font-semibold text-foreground hover:no-underline">
        Como estou gastando
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {totalExpenses === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma despesa registrada neste mês.
          </p>
        ) : (
          <>
            <div className="w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={200} minWidth={0}>
              <BarChart data={data} margin={{ top: 20, right: 4, left: 4, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis hide domain={[0, 100]} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {data.map((entry) => (
                    <Cell key={entry.group} fill={BAR_COLORS[entry.group]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(v: number) => `${v}%`}
                    style={{ fontSize: 12, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                  />
                </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 px-2 text-xs text-muted-foreground min-[420px]:grid-cols-3">
              {(Object.keys(groups) as GroupType[]).map((g) => (
                <span key={g} className="text-center [overflow-wrap:normal]">{GROUP_LABELS[g]}: {formatCurrency(groups[g])}</span>
              ))}
            </div>
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default SpendingAccordion;
