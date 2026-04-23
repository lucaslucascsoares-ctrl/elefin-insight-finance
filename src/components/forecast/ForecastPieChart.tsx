import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { ForecastDetailSlice } from '@/lib/forecastDetail';

interface ForecastPieChartProps {
  slices: ForecastDetailSlice[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ForecastPieChart = ({ slices }: ForecastPieChartProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[160px_320px] lg:justify-start lg:items-start lg:gap-8">
        <div className="flex flex-col items-start gap-3 lg:w-[160px]">
          <div className="grid w-full grid-cols-1 justify-items-start gap-3">
          {slices.map((slice, index) => (
            <button
              key={slice.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`w-full max-w-[160px] rounded-2xl border px-3 py-3 text-center transition-colors ${
                activeIndex === index
                  ? 'border-[#8A9A68] bg-[linear-gradient(180deg,#FFFFFF,#FBFDF7)] shadow-[0_14px_28px_rgba(92,134,109,0.12),0_4px_10px_rgba(31,42,35,0.04)] dark:border-[#3E5542] dark:bg-[linear-gradient(180deg,#2A3A31,#202D26)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-[#D6E1CC] bg-[linear-gradient(180deg,#FFFFFF,#FBFDF7)] shadow-[0_12px_24px_rgba(92,134,109,0.08),0_3px_8px_rgba(31,42,35,0.03)] hover:bg-[linear-gradient(180deg,#FFFFFF,#F8FBF3)] dark:border-[#3E5542] dark:bg-[linear-gradient(180deg,#27362D,#1E2A23)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)] dark:hover:bg-[linear-gradient(180deg,#2B3B31,#212E26)]'
              }`}
            >
              <span className="block text-center text-[11px] font-medium text-muted-foreground dark:text-[#ABBC82] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">{slice.label}</span>
              <span className="mt-1 block text-center text-sm font-semibold text-foreground dark:text-[#E8EEE9] dark:[text-shadow:0_1px_4px_rgba(0,0,0,0.40)]">{formatCurrency(slice.value)}</span>
            </button>
          ))}
          </div>
        </div>

        <div className="mx-auto flex h-72 w-full max-w-[320px] items-center justify-center lg:justify-self-center">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius={72}
                outerRadius={112}
                paddingAngle={4}
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onClick={(_, index) => setActiveIndex(index)}
              >
                {slices.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} stroke="hsl(var(--card))" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '16px',
                  color: 'hsl(var(--popover-foreground))',
                }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForecastPieChart;
