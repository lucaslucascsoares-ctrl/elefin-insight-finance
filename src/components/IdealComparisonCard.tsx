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
    cardLabel: CHART_LABELS[group],
    value: total > 0 ? Math.round((groups[group] / total) * 100) : 0,
    amount: groups[group],
    group,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <section className="px-3 pt-1 min-[380px]:px-4" aria-label={title}>
      <div className="flex h-fit min-w-0 flex-col self-start overflow-hidden rounded-[28px] border border-[#D6E1CC] bg-[linear-gradient(180deg,#F1F5E9,#E8EEDB)] px-3 py-3.5 shadow-[0_18px_36px_rgba(92,134,109,0.08)] min-[380px]:px-5 min-[380px]:py-5 dark:border-[#263731] dark:bg-[linear-gradient(180deg,#111A17,#16211D)] dark:shadow-[0_18px_38px_rgba(3,10,8,0.36)]">
        <h3 className="mb-4 text-center text-[15px] font-semibold text-[#314238] dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">{title}</h3>

        <div className="w-full min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height={188} minWidth={0}>
            <BarChart data={data} margin={{ top: 18, right: 2, left: -24, bottom: 8 }}>
              <XAxis
                dataKey="chartLabel"
                axisLine={false}
                tickLine={false}
                interval={0}
                tickMargin={6}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[20, 40, 60, 80, 100]}
                axisLine={false}
                tickLine={false}
                width={28}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              />
              {[20, 40, 60, 80, 100].map((tick) => (
                <ReferenceLine
                  key={tick}
                  y={tick}
                  stroke="rgba(138, 154, 104, 0.54)"
                  strokeDasharray="4 4"
                />
              ))}
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={76}>
                {data.map((entry) => (
                  <Cell key={entry.group} fill={BAR_COLORS[entry.group]} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={8}
                  formatter={(value: number) => `${value}%`}
                  style={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-col border-t border-border pt-3">
          <div className="grid grid-cols-3 gap-2 min-[380px]:gap-2.5 min-[420px]:gap-3">
            {data.map((item) => (
              <div
                key={item.group}
                className="flex min-h-[106px] min-w-0 flex-col items-center justify-center rounded-[24px] bg-[#FDFEFB] px-2 py-3 text-center shadow-[0_14px_28px_rgba(92,134,109,0.08)] min-[380px]:min-h-[112px] min-[380px]:px-2.5 min-[380px]:py-3.5 min-[420px]:min-h-[124px] min-[420px]:px-3 min-[420px]:py-4 dark:border dark:border-[#3E5542] dark:bg-[linear-gradient(180deg,#27362D,#1E2A23)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <p className="max-w-full text-center text-[8px] font-medium leading-[1.35] tracking-tight text-[#9B7A4B] min-[380px]:text-[8.5px] min-[420px]:text-[10px] min-[420px]:leading-[1.45] dark:text-muted-foreground dark:[text-shadow:none]">
                  {item.cardLabel}
                </p>
                <p className="mt-2 max-w-full whitespace-nowrap text-center text-[11px] font-semibold text-[#314238] min-[380px]:text-[11.5px] min-[420px]:mt-2.5 min-[420px]:text-[13px] dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">
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
