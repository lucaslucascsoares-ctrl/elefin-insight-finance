import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts';
import { Category, GROUP_LABELS, GroupType, Transaction } from '@/types/finance';

interface IdealComparisonCardProps {
  transactions: Transaction[];
  categories: Category[];
}

const BAR_COLORS: Record<GroupType, string> = {
  essenciais: 'hsl(var(--primary))',
  desejos: 'hsl(var(--chart-desejos))',
  prioridades: 'hsl(var(--chart-prioridades))',
};

const IdealComparisonCard = ({ transactions, categories }: IdealComparisonCardProps) => {
  const monthExpenses = transactions.filter((transaction) => transaction.type === 'expense');
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const groups: Record<GroupType, number> = { essenciais: 0, desejos: 0, prioridades: 0 };

  monthExpenses.forEach((transaction) => {
    const category = categoryMap.get(transaction.category_id || '');
    if (category) groups[category.group_type] += Number(transaction.amount);
  });

  const totalExpenses = Object.values(groups).reduce((sum, value) => sum + value, 0);

  const data = (Object.keys(groups) as GroupType[]).map((group) => ({
    name: GROUP_LABELS[group],
    value: totalExpenses > 0 ? Math.round((groups[group] / totalExpenses) * 100) : 0,
    amount: groups[group],
    group,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <section id="ideal-section" className="px-4 pt-4">
      <div className="rounded-[26px] border border-border bg-card px-4 py-5 shadow-sm">
        <h3 className="mb-5 text-center text-[15px] font-semibold text-foreground">
          Seu mes comparado ao ideal
        </h3>

        {totalExpenses === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma despesa registrada neste mes.
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={92}>
                  {data.map((entry) => (
                    <Cell key={entry.group} fill={BAR_COLORS[entry.group]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value: number) => `${value}%`}
                    style={{ fontSize: 12, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-4">
              {data.map((item) => (
                <div key={item.group} className="rounded-xl bg-muted/40 px-2 py-2 text-center">
                  <p className="text-[11px] font-medium text-muted-foreground">{item.name}</p>
                  <p className="mt-1 text-[13px] font-semibold text-foreground">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default IdealComparisonCard;
