import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { GROUP_LABELS, GroupType } from '@/types/finance';

interface IdealComparisonCardProps {
  title: string;
  groups: Record<GroupType, number>;
  emptyMessage: string;
}

const BAR_COLORS: Record<GroupType, string> = {
  essenciais: 'hsl(var(--primary))',
  desejos: 'hsl(var(--chart-desejos))',
  prioridades: 'hsl(var(--chart-prioridades))',
};

const CHART_LABELS: Record<GroupType, string> = {
  essenciais: 'Essenciais',
  desejos: 'Estilo de Vida',
  prioridades: 'Prioridades',
};

const IdealComparisonCard = ({ title, groups, emptyMessage }: IdealComparisonCardProps) => {
  const total = Object.values(groups).reduce((sum, value) => sum + value, 0);

  const data = (Object.keys(groups) as GroupType[]).map((group) => ({
    chartLabel: CHART_LABELS[group],
    name: GROUP_LABELS[group],
    value: total > 0 ? Math.round((groups[group] / total) * 100) : 0,
    amount: groups[group],
    group,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <section className="px-4 pt-4" aria-label={title}>
      <div className="rounded-[26px] border border-border bg-card px-4 py-5 shadow-sm dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_34px_rgba(3,10,8,0.34)]">
        <h3 className="mb-5 text-center text-[15px] font-semibold text-foreground">{title}</h3>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 24, right: 8, left: -12, bottom: 18 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="chartLabel"
              axisLine={false}
              tickLine={false}
              interval={0}
              tickMargin={8}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[20, 40, 60, 80, 100]}
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
                offset={8}
                formatter={(value: number) => `${value}%`}
                style={{ fontSize: 12, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 border-t border-border pt-4">
          <div className="grid grid-cols-3 gap-3">
            {data.map((item) => (
              <div key={item.group} className="rounded-2xl bg-muted/30 px-3 py-4 text-center dark:border dark:border-[#263731] dark:bg-[#1B2823]">
                <p className="break-words text-[11px] font-medium leading-6 text-muted-foreground">{item.name}</p>
                <p className="mt-1 break-words text-[13px] font-semibold text-foreground">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
          {total === 0 ? <p className="mt-4 text-center text-xs text-muted-foreground">{emptyMessage}</p> : null}
        </div>
      </div>
    </section>
  );
};

export default IdealComparisonCard;
