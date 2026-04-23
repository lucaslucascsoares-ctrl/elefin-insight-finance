import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { GROUP_LABELS, GroupType } from '@/types/finance';

interface IdealComparisonCardProps {
  title: string;
  groups: Record<GroupType, number>;
  footerMessage?: string;
  emptyMessage?: string;
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

const IdealComparisonCard = ({ title, groups, footerMessage, emptyMessage }: IdealComparisonCardProps) => {
  const total = Object.values(groups).reduce((sum, value) => sum + value, 0);
  const message = footerMessage ?? emptyMessage ?? '';

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
    <section className="px-4 pt-1" aria-label={title}>
      <div className="flex h-fit flex-col self-start overflow-hidden rounded-[28px] border border-[#D6E1CC] bg-[linear-gradient(180deg,#F1F5E9,#E8EEDB)] px-5 py-5 shadow-[0_18px_36px_rgba(92,134,109,0.08)] dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.36)]">
        <h3 className="mb-5 text-center text-[15px] font-semibold text-[#314238] dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">{title}</h3>

        <div className="w-full min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height={200} minWidth={0}>
            <BarChart data={data} margin={{ top: 24, right: 8, left: -12, bottom: 18 }}>
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
              {[20, 40, 60, 80, 100].map((tick) => (
                <ReferenceLine
                  key={tick}
                  y={tick}
                  stroke="rgba(138, 154, 104, 0.54)"
                  strokeDasharray="4 4"
                />
              ))}
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
        </div>

        <div className="mt-4 flex flex-col border-t border-border pt-4">
          <div className="grid grid-cols-3 gap-3">
            {data.map((item) => (
              <div
                key={item.group}
                className="flex min-h-[118px] flex-col items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.68)] px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border dark:border-[#3E5542] dark:bg-[linear-gradient(180deg,#27362D,#1E2A23)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <p className="max-w-full break-words text-center text-[12px] font-bold leading-5 tracking-[0.01em] text-[#9B7A4B] [text-shadow:0_1px_0_rgba(255,255,255,0.42)] dark:text-muted-foreground dark:[text-shadow:none]">{item.name}</p>
                <p className="mt-2 max-w-full break-words text-center text-[13px] font-semibold text-[#314238] dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
          {total === 0 && message ? <p className="mt-4 text-center text-xs text-muted-foreground dark:text-[#94A39B]">{message}</p> : null}
        </div>
      </div>
    </section>
  );
};

export default IdealComparisonCard;
